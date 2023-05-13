const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

const setBasics = async (
  myStream,
  socket,
  userSocketId,
  videoContainerEl,
  name
) => {
  const pc = new RTCPeerConnection(configuration);
  let myVideoSender;

  for (const track of myStream.getTracks()) {
    const sender = pc.addTrack(track, myStream);
    if (track.kind === "video") myVideoSender = sender;
  }

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("candidate", { to: userSocketId, candidate: e.candidate });
    }
  };

  pc.ontrack = (e) => {
    const el = videoContainerEl.querySelector(`#id${userSocketId}`);
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
    videoContainerEl.appendChild(divEl);

    // styling purpose
    videoContainerEl.querySelector("#divMine").className = "";
  };

  return [pc, myVideoSender];
};

export const createOffer = async (
  socket,
  userSocketId,
  myStream,
  videoContainerEl,
  name
) => {
  const [pc, myVideoSender] = await setBasics(
    myStream,
    socket,
    userSocketId,
    videoContainerEl,
    name
  );
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  return [pc, offer, myVideoSender];
};

export const createAnswer = async (
  socket,
  userSocketId,
  myStream,
  videoContainerEl,
  offer,
  name
) => {
  const [pc, myVideoSender] = await setBasics(
    myStream,
    socket,
    userSocketId,
    videoContainerEl,
    name
  );

  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  return [pc, answer, myVideoSender];
};
