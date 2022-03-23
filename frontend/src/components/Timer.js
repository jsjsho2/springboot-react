import React, {useEffect, useRef, useState} from 'react'
import ReactDOM from "react-dom";
import {CLink} from '@coreui/react'
import {Spin} from "antd";
import useStore from "../store/store";

const STATUS = {
    STARTED: 'Started',
    STOPPED: 'Stopped',
}

const Timer = (props) => {

    const {sessionTime, redirectUrl} = useStore();
    const [secondsRemaining, setSecondsRemaining] = useState(sessionTime);
    const [status, setStatus] = useState(STATUS.STOPPED);

    const secondsToDisplay = secondsRemaining % 60;
    const minutesRemaining = (secondsRemaining - secondsToDisplay) / 60;
    const minutesToDisplay = minutesRemaining % 60;
    const hoursToDisplay = (minutesRemaining - minutesToDisplay) / 60;

    const handleRestart = () => {
        setStatus(STATUS.STOPPED);
        setSecondsRemaining(sessionTime);
        setStatus(STATUS.STARTED);
    }

    useInterval(
        () => {
            if (secondsRemaining > 0) {
                setSecondsRemaining(secondsRemaining - 1)
            } else {
                setStatus(STATUS.STOPPED)
                ReactDOM.render(
                    <>
                        <div className="token-checking">
                            세션이 만료되었습니다.<br/>
                            새로고침 (토큰 유효 재검증) 혹은 다시 로그인 후 접근 해주세요.<br/>
                            Redirect URL:&nbsp;
                            <CLink href={redirectUrl}>
                                {redirectUrl}
                            </CLink>
                            <Spin/>
                        </div>
                    </>,
                    document.getElementById('root'),
                );
            }
        },
        status === STATUS.STARTED ? 1000 : null,
    )

    useEffect(() => {
        handleRestart();
    }, [sessionTime]);

    useEffect(() => {
        if (props.signal) {
            handleRestart();
            props.setSignal(false);
        }
    }, [props.signal]);

    const styleObj = {
        fontSize: '15px',
        textAlign: 'center'
    }

    return (
        <div className="App">
            <div className={'time-count'}>
                <div className="ant-statistic-title">SESSION TIME</div>
                <p style={styleObj}>
                    <span>
                        {twoDigits(hoursToDisplay)}:
                        {twoDigits(minutesToDisplay)}:
                        {twoDigits(secondsToDisplay)}
                    </span>
                </p>
            </div>
        </div>
    )
}

function useInterval(callback, delay) {
    const savedCallback = useRef()

    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    useEffect(() => {
        function tick() {
            savedCallback.current()
        }

        if (delay !== null) {
            let id = setTimeout(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}

const twoDigits = (num) => String(num).padStart(2, '0')

export default Timer;