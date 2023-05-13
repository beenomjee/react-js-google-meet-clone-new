import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './Room.module.scss';
// socket.io
import { io } from 'socket.io-client';
// utility functions
import { getLocalStream, createOffer, createAnswer, formatAMPM } from '../../utils';
// reactor router dom
import { useNavigate } from 'react-router-dom';
// react redux
import { useDispatch, useSelector } from 'react-redux';
// custom
import { useStateWithCallback } from '../../hooks'
import { IconButton } from '../../components';
// icons
import { BsCameraVideoFill, BsCameraVideoOffFill, BsFillMicFill, BsFillMicMuteFill } from 'react-icons/bs'
import { MdCallEnd, MdOutlineScreenShare, MdOutlineStopScreenShare, MdSend } from 'react-icons/md'
import { BiMessageDetail } from 'react-icons/bi';
import { setUser } from '../../store';
import { toast } from 'react-toastify';

const Room = () => {
    const [socket, setSocket] = useState(null);
    const user = useSelector(store => store.user)
    const dispatch = useDispatch();
    // for webrtc
    const [myStream, setMyStream] = useState(null);
    const navigate = useNavigate();
    const videoContainerRef = useRef(null);
    const [connections, setConnections] = useState({});
    const [unsetCandidates, setUnsetCandidates] = useState([]);
    const [videoSenders, setVideoSenders] = useState([]);
    // for muting system
    const [enabledObj, setEnabledObj] = useStateWithCallback({ audio: true, video: true })
    // for message menu
    const [messageMenuOpen, setMessageMenuOpen] = useState(false);
    const [messageText, setMessageText] = useState('');
    const messageContainerRef = useRef(null);
    const [isNewMessage, setIsNewMessage] = useState(false);
    const audioElRef = useRef(null);
    // scren sharing
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [myScreenTrack, setMyScreenTrack] = useState(null);

    const setLocalStream = useCallback(async () => {
        try {
            if (!user.name) return;
            const stream = await getLocalStream();
            setMyStream(stream);
            videoContainerRef.current.querySelector('#mine').srcObject = stream;
        } catch (err) {
            alert("These permissions are required to access the room!");
            navigate('/');
        }
    }, [navigate, user.name]);

    const onJoiningRoom = useCallback(async ({ roomData }) => {
        for (let socketId in roomData) {
            const [pc, offer, myVideoSender] = await createOffer(socket, socketId, myStream, videoContainerRef.current, roomData[socketId].name);
            setConnections(prev => ({ ...prev, [socketId]: pc }))
            // pushing new sender to sender array
            setVideoSenders(p => ({ ...p, [socketId]: myVideoSender }));
            // sending offer
            socket.emit('offer', { to: socketId, offer })
        }

        // toast
        if (Object.keys(roomData).length === 0)
            toast.success(`Created the room!`)
        else
            toast.success(`Joined the room!`)

    }, [socket, myStream])

    const onComingOffer = useCallback(async ({ from, offer, name }) => {
        const [pc, answer, myVideoSender] = await createAnswer(socket, from, myStream, videoContainerRef.current, offer, name);
        setConnections(prev => ({ ...prev, [from]: pc }))
        // pushing new sender to sender array
        setVideoSenders(p => ({ ...p, [from]: myVideoSender }));
        // share screen track to newly added user if i already sharing screen
        if (isScreenSharing && myScreenTrack)
            myVideoSender.replaceTrack(myScreenTrack);

        // sending answer
        socket.emit('answer', { to: from, answer, enabledObj })
        // toast
        toast.info(`${name} joined the conversation!`)
    }, [socket, myStream, isScreenSharing, myScreenTrack, enabledObj]);

    // write here bcz i use this in answer coz of user mute settings
    const onUserMute = useCallback(async ({ from, enabledObj }) => {
        // styling for video
        if (enabledObj.video)
            videoContainerRef.current.querySelector(`#span${from}`)?.classList.remove(styles.display);
        else
            videoContainerRef.current.querySelector(`#span${from}`)?.classList.add(styles.display);

        // styling for audio
        if (videoContainerRef.current.querySelector(`#btn${from}1`)) {
            if (enabledObj.audio) {
                videoContainerRef.current.querySelector(`#btn${from}1`).style.display = "inline";
                videoContainerRef.current.querySelector(`#btn${from}2`).style.display = "none";
            }
            else {
                videoContainerRef.current.querySelector(`#btn${from}1`).style.display = "none";
                videoContainerRef.current.querySelector(`#btn${from}2`).style.display = "inline";
            }
        }
    }, [])

    const onAnswer = useCallback(async ({ from, answer, enabledObj }) => {
        const pc = connections[from];
        if (pc) {
            await pc.setRemoteDescription(answer);
            // also set user mute setting
            onUserMute({ from, enabledObj });
        } else {
            toast.error('Something went wrong!');
        }
    }, [connections, onUserMute])

    const onCandidate = useCallback(async ({ from, candidate }) => {
        const pc = connections[from];
        if (pc) {
            await pc.addIceCandidate(candidate);
        } else {
            setUnsetCandidates(prev => ([
                ...prev,
                { socketId: from, candidate }
            ]))
        }
    }, [connections]);

    const onUserLeave = useCallback(async ({ socketId, name }) => {
        const pc = connections[socketId];
        // delete connection
        if (pc) {
            await pc.close();
            const copy = { ...connections };
            delete copy[socketId];
            setConnections(copy)
        }
        // deleting sender
        const sender = videoSenders[socketId];
        if (sender) {
            const copy = { ...videoSenders };
            delete copy[socketId];
            setVideoSenders(copy)
        }
        videoContainerRef.current.querySelector(`#div${socketId}`)?.remove();
        toast.info(name + ' leave the conversation!');
    }, [connections, videoSenders])

    const onMute = (isVideo = false) => {
        if (isVideo && !isScreenSharing)
            setEnabledObj(prev => ({
                ...prev,
                video: !prev.video
            }), newState => {
                myStream.getVideoTracks()[0].enabled = newState.video;
                // styling
                videoContainerRef.current.querySelector('#nameMine').classList.toggle(styles.display);
                socket.emit('mute', { enabledObj: newState })
                toast.success(`Turned ${newState.video ? 'on' : 'off'} the camera!`)
            })
        else if (!isVideo)
            setEnabledObj(prev => ({
                ...prev,
                audio: !prev.audio
            }), newState => {
                myStream.getAudioTracks()[0].enabled = newState.audio;
                // styling
                if (newState.audio) {
                    videoContainerRef.current.querySelector('#btnMine1').style.display = "inline";
                    videoContainerRef.current.querySelector('#btnMine2').style.display = "none";
                }
                else {
                    videoContainerRef.current.querySelector('#btnMine1').style.display = "none";
                    videoContainerRef.current.querySelector('#btnMine2').style.display = "inline";
                }

                socket.emit('mute', { enabledObj: newState })
                toast.success(`Turned ${newState.audio ? 'on' : 'off'} the mic!`)
            })
        else
            toast.error("To turn off camera, stop the screen sharing first!");
    }

    const onCallLeave = async () => {
        for (const pcId in connections) {
            const pc = connections[pcId];
            for (const sender of pc.getSenders()) {
                await pc.removeTrack(sender)
            }
            pc.onicecandidate = null;
            pc.ontrack = null;
            await pc.close();
        }
        setConnections({});
        navigate('/')
        toast.success("Leave the room!");
    }

    const messageSendHandler = (e) => {
        e.preventDefault();
        socket.emit('message', { time: formatAMPM(new Date()), text: messageText });
        setMessageText('');
    }

    const onMessage = useCallback(({ from, name, text, time, }) => {
        const span1 = document.createElement('span');
        const span2 = document.createElement('span');
        const span3 = document.createElement('span');
        const p = document.createElement('p');
        span1.innerText = name;
        span2.innerText = text;
        span3.innerText = time;
        if (!Object.keys(connections).find(socketId => socketId === from))
            p.classList.add(styles.me)
        else
            audioElRef.current.play();

        p.appendChild(span1);
        p.appendChild(span2);
        p.appendChild(span3);

        messageContainerRef.current.appendChild(p);
        // sending to bottom
        messageContainerRef.current.scrollTo(0, messageContainerRef.current.scrollHeight)
        // seting new to true
        setIsNewMessage(true);
    }, [connections])

    const onScreenShare = async () => {
        // run if camera is on and screen is not already sharing
        if (!isScreenSharing && enabledObj.video) {
            try {
                const myScreenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
                const screenTrack = myScreenStream.getVideoTracks()[0];
                for (const myVideoSender in videoSenders) {
                    videoSenders[myVideoSender].replaceTrack(screenTrack);
                }

                screenTrack.onended = e => {
                    for (const myVideoSender in videoSenders) {
                        videoSenders[myVideoSender].replaceTrack(myStream.getVideoTracks()[0]);
                    }
                    // change capture stream to local stream
                    if (videoContainerRef.current.querySelector('#mine'))
                        videoContainerRef.current.querySelector('#mine').srcObject = myStream;
                    // set screen share to change icon
                    setIsScreenSharing(false);
                    // to share screen to new user
                    setMyScreenTrack(null);
                    toast.success("Stop screen sharing!");
                }

                // change local stream to capture stream
                if (videoContainerRef.current.querySelector('#mine'))
                    videoContainerRef.current.querySelector('#mine').srcObject = myScreenStream;
                // set screen share to change icon
                setIsScreenSharing(true);
                // to share screen to new user
                setMyScreenTrack(screenTrack);
                toast.success("Start screen sharing!");
            } catch (err) {
                toast.error("This permission is required for screen sharing!");
                setIsScreenSharing(false);
            }
        }
        // run if camera is on and screen is already sharing
        else if (isScreenSharing && enabledObj.video) {
            if (videoContainerRef.current.querySelector('#mine')) {
                // stoping video sharing
                videoContainerRef.current.querySelector('#mine').srcObject.getVideoTracks()[0].stop();
                videoContainerRef.current.querySelector('#mine').srcObject = myStream;
            }
            for (const myVideoSender in videoSenders) {
                videoSenders[myVideoSender].replaceTrack(myStream.getVideoTracks()[0]);
            }
            setIsScreenSharing(false);
            // to share screen to new user
            setMyScreenTrack(null);
            toast.success("Stop screen sharing!");
        }
        // run if camera is off
        else {
            toast.error(`Please turn on camera to ${isScreenSharing ? 'stop' : 'start'} screen sharing!`);
        }
    };

    // 1- run first time only and set stream
    useEffect(() => {
        setLocalStream();
    }, [setLocalStream])

    // 2- set socket and on return close camera
    useEffect(() => {
        if (!myStream) return;

        setSocket(io('http://localhost:3001'))
        return () => {
            for (let track of myStream.getTracks()) {
                if (track.readyState === 'live') {
                    track.stop();
                }
            }
        }

    }, [myStream])

    //3 - emit on socket if it exist and on return, turn off socket
    useEffect(() => {
        if (!socket) return;

        socket.emit('user:join', { ...user });
        return () => {
            socket.close();
            dispatch(setUser({ ...user, room: '' }))
        }
    }, [dispatch, socket, user])

    // 4- sockets listeners
    useEffect(() => {
        if (!socket) return;
        socket.on('user:join', onJoiningRoom);
        socket.on('offer', onComingOffer);
        socket.on('answer', onAnswer);
        socket.on('candidate', onCandidate);
        socket.on('user:leave', onUserLeave);
        socket.on('mute', onUserMute);
        socket.on('message', onMessage);
        return () => {
            socket.off('user:join', onJoiningRoom);
            socket.off('offer', onComingOffer)
            socket.off('answer', onAnswer);
            socket.off('candidate', onCandidate);
            socket.off('user:leave', onUserLeave);
            socket.off('mute', onUserMute);
            socket.off('message', onMessage);
        }
    }, [socket, onUserMute, onJoiningRoom, onComingOffer, onAnswer, onCandidate, onUserLeave, onMessage]);

    // 5- set unset candidates
    useEffect(() => {
        if (unsetCandidates.length === 0) return;
        const setRemainingCandidates = async () => {
            for (const candidate of unsetCandidates) {
                const pc = connections[candidate.socketId];
                if (pc) {
                    pc.addIceCandidate(candidate.candidate);
                }
            }
        }
        setRemainingCandidates()
    }, [connections, unsetCandidates]);

    // 6- for checking new message
    useEffect(() => {
        if (isNewMessage && messageMenuOpen) {
            setIsNewMessage(false);
        }
    }, [isNewMessage, messageMenuOpen])

    return (
        <div className={styles.container}>
            <div ref={videoContainerRef} className={styles.videoContainer}>
                <div className={styles.position} id='divMine'>
                    <span id='nameMine'>{user.name}</span>
                    <video id='mine' src="#" muted autoPlay playsInline></video>
                    <IconButton id="btnMine1"><BsFillMicFill /></IconButton>
                    <IconButton display="none" id="btnMine2"><BsFillMicMuteFill /></IconButton>
                </div>
            </div>
            <div className={styles.buttonContainer}>
                <div className={styles.left}></div>
                <div className={styles.center}>
                    <IconButton onClick={() => onMute(true)}>{enabledObj.video ? <BsCameraVideoFill /> : <BsCameraVideoOffFill />}</IconButton>
                    <IconButton onClick={() => onMute()}>{enabledObj.audio ? <BsFillMicFill /> : <BsFillMicMuteFill />}</IconButton>
                    <IconButton onClick={onScreenShare}>{isScreenSharing ? <MdOutlineStopScreenShare /> : <MdOutlineScreenShare />}</IconButton>
                    <IconButton onClick={onCallLeave}><MdCallEnd /></IconButton>
                </div>
                <div className={styles.right}>
                    <IconButton onClick={e => setMessageMenuOpen(p => !p)}><BiMessageDetail /><span className={isNewMessage ? styles.show : ''}></span><audio ref={audioElRef} src={process.env.PUBLIC_URL + "/audio/tone.mp3"}></audio></IconButton>
                </div>
            </div>

            {/* message menu */}
            {messageMenuOpen && <div onClick={e => setMessageMenuOpen(false)} className={styles.bgWrapper}></div>}
            <div className={`${styles.menu} ${messageMenuOpen ? styles.open : ''}`}>
                <div ref={messageContainerRef} className={styles.messages}>
                </div>
                <form action="#" onSubmit={messageSendHandler}>
                    <input value={messageText} onChange={e => setMessageText(e.target.value)} type="text" placeholder='Message' required />
                    <IconButton type='submit'><MdSend /></IconButton>
                </form>
            </div>
        </div>
    )
}

export default Room;