import React, { useRef, useState } from 'react'
import styles from './Home.module.scss';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from '../../components';
import { IoIosMenu } from 'react-icons/io'
import { useClickOutside } from '../../hooks';
import { logoutFromGoogle } from '../../firebase';

const Home = () => {
    const [room, setRoom] = useState('')
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(store => store.user);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(setUser({ ...user, room }))
        navigate('/room/' + room);
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
                    <input value={room} onChange={(e) => setRoom(e.target.value)} type="text" name="room" placeholder='Room Name' required />
                    <input type="submit" value="Enter" />
                </form>
            </div>
        </>
    )
}

export default Home