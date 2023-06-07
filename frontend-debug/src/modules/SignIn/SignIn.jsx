import React, { useEffect, useRef, useState } from 'react'
import styles from './SignIn.module.scss';
import { Link, useNavigate, } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeError, signInUser } from '../../store'
import { Loader } from '../../components';
import { FcGoogle } from 'react-icons/fc'
import { loginWithGoogle } from '../../firebase';

const SignIn = () => {
    const { error, name, isLoading } = useSelector(store => store.user);
    const emailInputRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [data, setData] = useState({
        email: '',
        password: '',
    })

    const handleChange = (e) => {
        setData(prev => ({ ...prev, [e.target.id]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(signInUser(data))
    }

    const googleLoginHandler = e => {
        loginWithGoogle();
    }

    // error checking
    useEffect(() => {
        if (emailInputRef.current)
            emailInputRef.current.focus();
    }, [error]);

    // name checking
    useEffect(() => {
        if (name) {
            navigate('/');
        }
    }, [navigate, name])

    // removing error at first rendering
    useEffect(() => {
        dispatch(removeError());
    }, [dispatch])

    return (isLoading ? <Loader /> :
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <h1>Sign In</h1>
                <form action="#" onSubmit={handleSubmit}>
                    <input type="email" required placeholder='Email' ref={emailInputRef} value={data.email} onChange={handleChange} id='email' />
                    <input autoComplete='on' type="password" required placeholder='Password' value={data.password} onChange={handleChange} id='password' />
                    <p className={`${styles.error} ${error ? styles.show : ''}`}>{error}</p>
                    <button type="submit">Login</button>
                    <button onClick={googleLoginHandler} className={styles.google} type='button'><span><FcGoogle /></span>Continue with Google</button>
                </form>
                <p>Don't have account? <Link to='/signup'>Sign Up</Link></p>
            </div>
        </div>
    )
}

export default SignIn