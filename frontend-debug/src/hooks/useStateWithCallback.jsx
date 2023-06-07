import { useCallback, useEffect, useRef, useState } from "react"

const useStateWithCallback = (initialState) => {
    const [state, setState] = useState(initialState);
    const cbRef = useRef(null);

    const customSetState = useCallback(
        (newState, cb = null) => {
            cbRef.current = cb;
            setState(prev => {
                return typeof newState === "function" ? newState(prev) : newState;
            })
        }, []
    )

    useEffect(() => {
        if (cbRef.current) {
            cbRef.current(state);
            cbRef.current = null;
        }
    }, [state]);

    return [state, customSetState];
}

export default useStateWithCallback;