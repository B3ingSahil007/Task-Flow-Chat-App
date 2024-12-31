import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { CiMenuKebab } from "react-icons/ci";
import { IoMdSearch } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const LeftSideBar = () => {
    const navigate = useNavigate()
    const { userData, chatData } = useContext(AppContext)
    const [user, setUser] = useState(null)
    const [showSearch, setShowSearch] = useState(false)

    const inputHandle = async (e) => {
        try {
            const input = e.target.value
            if (input) {
                setShowSearch(true)
                const userRef = collection(db, 'users')
                const q = query(userRef, where("username", "==", input.toLowerCase()))
                const querySnap = await getDocs(q)
                if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
                    setUser(querySnap.docs[0].data())
                    let userExist = false
                    chatData.map((user) => {
                        if (user.rId === querySnap.docs[0].data().id) {
                            userExist = true
                        }
                    })
                    if (!userExist) {
                        setUser(querySnap.docs[0].data())
                    }
                } else {
                    setUser(null)
                }
            } else {
                setShowSearch(false)
            }

        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Error fetching user data!");
        }
    }

    const addChat = async () => {
        const messagesRef = collection(db, 'messages')
        const chatsRef = collection(db, 'chats')
        try {
            const newMessageRef = doc(messagesRef)
            await setDoc(newMessageRef, {
                createAt: serverTimestamp(),
                messages: []
            })

            await updateDoc(doc(chatsRef, user.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })

            await updateDoc(doc(chatsRef, userData.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    const setChat = async (item) => {
        console.log(item);
    }

    return (
        <>
            <div className="ls bg-gradient-to-b from-gray-800 via-gray-900 to-black text-white h-[88.2vh]">
                <div className="ls-top p-2 sm:p-[10px] h-full flex flex-col">
                    <div className="ls-nav flex justify-between items-center">
                        <div className="flex items-center w-full">
                            <div className="ls-search bg-gray-700 flex items-center gap-2 px-2 py-2 mx-0 rounded w-full">
                                <IoMdSearch className="text-xl sm:text-2xl" />
                                <input onChange={inputHandle} type="text" className="bg-transparent border-none outline-none text-[12px] sm:text-[15px] w-full" placeholder="Search User's Name Here . . ." />
                            </div>
                            <div className="menu ml-5 sm:ml-7 relative p-2 group">
                                <CiMenuKebab className="cursor-pointer text-xl sm:text-2xl" />
                                <div className='sub-menu absolute top-[100%] right-0 w-[120px] sm:w-[140px] p-[10px] bg-gray-500 text-black rounded hidden group-hover:block'>
                                    <p onClick={() => navigate('/profile')} className='hover:text-gray-200 cursor-pointer'>Edit Profile</p>
                                    <hr className='border-none h-[1px] bg-black' />
                                    <p className='hover:text-gray-200 cursor-pointer'>Log Out</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ls-list flex flex-col overflow-y-auto mt-3 scrollbar-thin">
                        {showSearch && user ?
                            <div onClick={addChat} className='friends group flex items-center gap-3 px-3 py-2 cursor-pointer text-xs sm:text-sm hover:bg-gray-600 rounded-lg'>
                                <img className='logo w-8 sm:w-10 aspect-[1/1] rounded-full' src={user.avatar ? user.avatar : assets.avatar_icon} alt="User_Avatar_Image" />
                                <p>{user.name}</p>
                            </div> : chatData && chatData.map((item, index) => (
                                <div onClick={() => setChat(item)} key={index} className="friends group flex items-center gap-3 px-3 py-2 cursor-pointer text-xs sm:text-sm hover:bg-gray-600 rounded-lg" >
                                    <img src={item.userData.avatar} className="logo w-8 sm:w-10 aspect-[1/1] rounded-full" alt="Profile Icon" />
                                    <div className="flex flex-col">
                                        <p>{item.userData.name}</p>
                                        <span className="text-[10px] sm:text-xs text-gray-500 group-hover:text-gray-400">
                                            {item.lastMessage}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeftSideBar;