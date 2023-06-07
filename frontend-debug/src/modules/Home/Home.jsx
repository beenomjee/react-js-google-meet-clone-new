import React, { useRef, useState } from 'react'
import styles from './Home.module.scss';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from '../../components';
import { IoIosMenu } from 'react-icons/io'
import { useClickOutside } from '../../hooks';
import { logoutFromGoogle } from '../../firebase';
import { toast } from 'react-toastify';
import { genUniqueId } from '../../utils';

const Home = () => {
    const [room, setRoom] = useState('')
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(store => store.user);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (room.startsWith(window.location.origin) && room.split('/')[4]) {
            dispatch(setUser({ ...user, room: room.split('/')[4] }))
            navigate("/room/" + room.split('/')[4]);
        } else if (!room.startsWith('http')) {
            dispatch(setUser({ ...user, room }))
            navigate('/room/' + room);
        } else {
            toast.error("Enter a valid room code or link!");
        }
    }


    useClickOutside(menuRef, () => {
        setIsMenuOpen(false);
    })
    return (
        <>
            <div ref={menuRef} className={styles.topMenu}>
                <IconButton onClick={e => setIsMenuOpen(p => !p)}><IoIosMenu /></IconButton>
                <div className={`${styles.menu} ${isMenuOpen ? styles.open : ''}`}>
                    <button onClick={logoutFromGoogle}>Logout</button>
                </div>
            </div>
            <div className={styles.center}>
                <form onSubmit={handleSubmit} action="#" className={styles.container}>
                    <input value={room} onChange={(e) => setRoom(e.target.value)} type="text" name="room" placeholder='Enter a code or link' required />
                    <input type="submit" value="Join " />
                    <input onClick={e => navigate(`/room/${genUniqueId()}`)} type='button' value="Start an instant meeting" />
                </form>
            </div>
        </>
    )
}

export default Home