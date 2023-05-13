import React from 'react'
import styles from './Loader2.module.scss';
import { BiLoaderAlt } from 'react-icons/bi'

const Loader2 = ({ className, ...props }) => {
    return (
        <span {...props} className={`${styles.loader} ${className ?? ''}`}><BiLoaderAlt /></span>
    )
}

export default Loader2