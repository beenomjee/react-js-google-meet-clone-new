import React, { forwardRef } from 'react'
import styles from './IconButton.module.scss';

const IconButton = ({ children, className, ...props }, ref) => {

    return (
        <button {...props} ref={ref} className={`${styles.button} ${className ?? ''}`}>{children}</button>
    )
}

export default forwardRef(IconButton);