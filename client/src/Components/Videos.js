import React, { useState, useEffect } from 'react';
import Youtube from 'react-youtube';
import Dictionary from '../Components/Dictionary';
import loader from '../Images/loader3.gif';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import './Common.scss';
import './Videos.scss';

function Videos(props) {
  const {
    videos,
    videoState,
    dictionary,
    updateStartTimeTo,
    updateCurrentTo,
    updateCurrentTimeTo,
    updateVideoOrder,
  } = props;
  let captions;
  let videoId;
  let videoInfo;
  let startIndex;
  let firstStartTime;
  let firstDuration;
  let timer;
  let timers = []; //랜더링 될때 마다 timers 확인
  clearTimerArr(timers); //스코프 확인

  const [isAddedClass, setIsAddedClass] = useState(false);
  function onSwitchToggle() {
    setIsAddedClass(!isAddedClass);
  }
  useEffect(() => {
    if (videos.info[videoState.order]) {
      videoInfo = videos.info[videoState.order];
      videoId = videoInfo.id;
      startIndex = videoInfo.startIndex;
      firstStartTime = Math.floor(
        Number(videoInfo.captions[startIndex].start),
      );
      firstDuration = Number(videoInfo.captions[startIndex].dur);
      updateStartTimeTo(firstStartTime, firstDuration);
      updateCurrentTimeTo(firstStartTime);
    }
  }, [videos.info[videoState.order]]);

  if (videos.foundWord && videos.info.length > 0) {
    videoInfo = videos.info[videoState.order];
    videoId = videoInfo.id;
    startIndex = videoInfo.startIndex;

    captions = videos.info[videoState.order].captions.map(
      (caption, index) => {
        const captionStart = Number(caption.start);
        const captionDuration = Number(caption.dur);
        let count = 0;
        const captionClassBox = ['caption-container'];
        if (index === startIndex) {
          captionClassBox.push('highlight-pink');
        }
        if (
          captionStart < videoState.currentTime &&
          videoState.currentTime < captionStart + captionDuration + 0.1
        ) {
          captionClassBox.push('highlight-gray');
        }

        return (
          <div
            key={index}
            className={captionClassBox.join(' ')}
            onClick={() => {
              //Prevent from not rendering of the same state
              if (count === 0) {
                caption.start -= 0.0001;
                count++;
              } else {
                caption.start += 0.0001;
                count--;
              }
              updateStartTimeTo(caption.start, caption.dur);
            }}
          >
            <span className="caption-content start">
              {caption.startForDisplay}
            </span>
            <span className="caption-content text">
              {caption.text}
            </span>
          </div>
        );
      },
    );
  } else if (videos.foundWord && videos.info.length === 0) {
    return (
      <div className="Videos">
        <div className="error-no-videos">
          <div>Cannot find searched word in the categories.</div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="videos-loader">
        <img src={loader} />
      </div>
    );
  }

  //Youtube video options
  const options = {
    playerVars: {
      autoplay: 1,
      start: videoState.startTimeSeconds,
      // end: videoState.startTimeSeconds + videoState.durationMilliseconds / 1000,
      modestbranding: 1,
      loop: 1,
    },
  };

  function clearTimerArr(arr) {
    arr.forEach(timer => {
      console.log('timerClear', timer);
      clearTimeout(timer);
    });
  }

  function onPlayerReady(event) {
    clearTimerArr(timers);
    console.log('onPlayerReady 실행되는지');

    //처음 비디오 실행시 타이머 설정
    timer = setTimeout(() => {
      event.target.pauseVideo();
    }, videoState.durationMilliseconds);
    timers.push(timer);
    console.log('playerReady의 타이머 콘솔:', timers);
  }

  function onPlayerStateChange(event) {
    console.log('onPlayerStateChange 실행');
    console.log('onStateChange 타이머 모음 배열:', timers);

    console.log(event.data);
    //event.data
    // {0: 종료, 1: 재생, 2:일시중지, 3: 버퍼링}
    // debugger;
  }

  function onPlayerPlay(event) {
    console.log('onPlayerPlay 실행');
    console.log(event.target.getCurrentTime());
  }

  function onPlayerPause(event) {
    timer = setTimeout(() => {
      event.target.pauseVideo();
    }, videoState.durationMilliseconds);
    const currentTime = event.target.getCurrentTime();
    console.log(event.target.getCurrentTime());
    updateCurrentTimeTo(currentTime);
    event.target.playVideo();
  }

  // CatpionsContainer size toggle
  const captionsContainerClassBox = ['captions-container'];
  const captionsWrapperClassBox = ['captions-wrapper'];
  if (isAddedClass) {
    captionsContainerClassBox.push('foldTo150');
    captionsWrapperClassBox.push('foldTo70');
  }

  return (
    <div className="Videos">
      {dictionary && <Dictionary {...props} />}
      <span className="foundWord">{videos.foundWord}</span>
      <div className="player-and-captions-container">
        <Youtube
          videoId={videoId}
          opts={options}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          onPlay={onPlayerPlay}
          onPause={onPlayerPause}
        />
        <div className="player"></div>

        <div className={captionsContainerClassBox.join(' ')}>
          <div className="caption-title-wrapper">
            <h1 className="captions-title">Transcript</h1>
            <Switch
              defaultChecked
              value="checkedA"
              inputProps={{ 'aria-label': 'secondary checkbox' }}
              onClick={() => onSwitchToggle()}
            />
          </div>
          {/* caption-title-wrapper */}
          <div className={captionsWrapperClassBox.join(' ')}>
            {captions}
          </div>
          {/* captionsWrapper */}
        </div>
        {/* captionsContainerClassBox */}

        <div className="video-controller-container">
          <Button
            size="large"
            onClick={() => updateVideoOrder(-1)}
            disabled={videoState.order <= 0}
            color="secondary"
          >
            <KeyboardArrowLeft />
            BACK
          </Button>
          <div
            className="repeat-button"
            onClick={() => updateCurrentTo('repeat')}
          >
            repeat
          </div>
          <Button
            size="large"
            onClick={() => updateVideoOrder(1)}
            disabled={videoState.order >= videos.info.length - 1}
            color="secondary"
          >
            NEXT
            <KeyboardArrowRight />
          </Button>
        </div>
        {/*video-controller-container*/}
      </div>
      {/*player-and-captions-container*/}
    </div>
  );
}

export default Videos;
