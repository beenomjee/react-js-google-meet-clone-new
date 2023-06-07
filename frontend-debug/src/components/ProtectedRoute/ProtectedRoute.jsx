import React, { useEffect } from 'react'
// import styles from './ProtectedRoute.module.scss';
import { Loader } from '../';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setUser } from '../../store';

const ProtectedRoute = ({ element: Element }) => {
    const user = useSelector(store => store.user);
    const dispatch = useDispatch();
    const { room } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.name && !user.isLoading) {
            navigate('/signin');
        }
        else if (!user.room && !room) {
            navigate('/');
        }
        else if (user.room !== room) {
            dispatch(setUser({ ...user, room }))
        }
    }, [user, navigate, room, dispatch]);

    return (
        user.isLoading ? <Loader /> : <Element />
    )
}

export default ProtectedRoute;