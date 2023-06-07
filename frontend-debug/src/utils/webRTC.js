const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun01.sipphone.com" },
    { urls: "stun:stun.ekiga.net" },
    { urls: "stun:stun.fwdnet.net" },
    { urls: "stun:stun.ideasip.com" },
    { urls: "stun:stun.iptel.org" },
    { urls: "stun:stun.rixtelecom.se" },
    { urls: "stun:stun.schlund.de" },
    { urls: "stun:stunserver.org" },
    { urls: "stun:stun.softjoys.com" },
    { urls: "stun:stun.voiparound.com" },
    { urls: "stun:stun.voipbuster.com" },
    { urls: "stun:stun.voipstunt.com" },
    { urls: "stun:stun.voxgratia.org" },
    { urls: "stun:stun.xten.com" },
  ],
};

const setBasics = async (
  myStream,
  socket,
  userSocketId,
  videoContainerEl,
  name,
  screenSharingData,
  styles
) => {
  console.log(`Creating new RTC connection for ${name}-${userSocketId}`);
  const pc = new RTCPeerConnection(configuration);
  let myVideoSender;

  console.log(
    `Adding local tracks to RTC connection for ${name}-${userSocketId}`
  );
  for (const track of myStream.getTracks()) {
    const sender = pc.addTrack(track, myStream);
    if (track.kind === "video") myVideoSender = sender;
  }

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      console.log(
        `Sending ice candidates of RTC connection to ${name}-${userSocketId}`
      );
      socket.emit("candidate", { to: userSocketId, candidate: e.candidate });
    }
  };

  pc.ontrack = (e) => {
    const el = videoContainerEl.querySelector(`#id${userSocketId}`);
    console.log(`Receiving tracks from ${name}-${userSocketId}`);
    if (el) {
      el.srcObject = e.streams[0];
      return;
    }

    const divEl = document.createElement("div");
    // adding video
    divEl.id = `div${userSocketId}`;
    const videoEl = document.createElement("video");
    videoEl.autoplay = true;
    videoEl.playsInline = true;
    videoEl.id = `id${userSocketId}`;
    videoEl.srcObject = e.streams[0];
    divEl.appendChild(videoEl);
    // adding span
    const spanEl = document.createElement("span");
    spanEl.id = `span${userSocketId}`;
    spanEl.innerHTML = name;
    divEl.appendChild(spanEl);
    // adding buttons
    const buttonEl1 = document.createElement("button");
    const buttonEl2 = document.createElement("button");
    buttonEl1.id = `btn${userSocketId}1`;
    buttonEl2.id = `btn${userSocketId}2`;
    buttonEl1.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"></path><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"></path></svg>`;
    buttonEl2.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z"></path><path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"></path></svg>`;
    buttonEl2.setAttribute("display", "none");
    divEl.appendChild(buttonEl1);
    divEl.appendChild(buttonEl2);
    // styling purpose
    // adding styles to div if already someone sharing screen
    if (screenSharingData.isRunning) {
      if (userSocketId === screenSharingData.socketId) {
        videoContainerEl.querySelector("#divMine").classList.add(styles.none);
        divEl.classList.add(styles.position);
      } else {
        divEl.classList.add(styles.none);
      }
    } else {
      videoContainerEl.querySelector("#divMine").className = "";
    }

    videoContainerEl.appendChild(divEl);
  };

  return [pc, myVideoSender];
};

export const createOffer = async (
  socket,
  userSocketId,
  myStream,
  videoContainerEl,
  name,
  screenSharingData,
  styles
) => {
  const [pc, myVideoSender] = await setBasics(
    myStream,
    socket,
    userSocketId,
    videoContainerEl,
    name,
    screenSharingData,
    styles
  );
  console.log(`Create offer for ${name}-${userSocketId}`);
  const offer = await pc.createOffer();
  console.log(`Set local description for ${name}-${userSocketId}`);
  await pc.setLocalDescription(offer);

  return [pc, offer, myVideoSender];
};

export const createAnswer = async (
  socket,
  userSocketId,
  myStream,
  videoContainerEl,
  offer,
  name,
  screenSharingData,
  styles
) => {
  console.log(screenSharingData);
  const [pc, myVideoSender] = await setBasics(
    myStream,
    socket,
    userSocketId,
    videoContainerEl,
    name,
    screenSharingData,
    styles
  );
  console.log(`Set remote description for ${name}-${userSocketId}`);
  await pc.setRemoteDescription(offer);
  console.log(`Create answer for ${name}-${userSocketId}`);
  const answer = await pc.createAnswer();
  console.log(`Set local description for ${name}-${userSocketId}`);
  await pc.setLocalDescription(answer);

  return [pc, answer, myVideoSender];
};
