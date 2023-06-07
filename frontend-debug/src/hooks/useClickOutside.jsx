import { useCallback, useEffect } from 'react'

const useClickOutside = (ref, cb) => {
    const main = useCallback((e) => {
        if (ref.current === null || ref.current.contains(e.target))
            return;

        cb(e);
    }, [ref, cb]);

    useEffect(() => {
        document.addEventListener('click', main);
        return () => {
            document.removeEventListener('click', main);
        }
    }, [main])

}

export default useClickOutside