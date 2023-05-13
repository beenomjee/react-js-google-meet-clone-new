const getLocalStream = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: {
        max: 640,
        min: 256,
        ideal: 256,
      },
      height: {
        max: 480,
        min: 144,
        ideal: 144,
      },
      frameRate: 7,
    },
  });

  return stream;
};

export default getLocalStream;
