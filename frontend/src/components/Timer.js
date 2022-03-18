import React, {useEffect} from 'react';
import useTimer, {TimerAction} from './UseTimer';
import ReactDOM from "react-dom";
import {Spin} from "antd";

const Timer = (props) => {
    const {totalSeconds, minutes, seconds, timerDispatch} = useTimer(60 * 20);

    useEffect(() => {
        timerDispatch({
            type: TimerAction.START
        });
    }, []);
    useEffect(() => {
        if (props.signal) {
            timerDispatch({
                type: TimerAction.PAUSE
            });

            setTimeout(() => {
                timerDispatch({
                    type: TimerAction.RESET
                });

                setTimeout(() => {
                    timerDispatch({
                        type: TimerAction.START
                    });

                    props.setSignal(false);
                }, 100)
            }, 1000)
        }
    }, [props.signal]);

    const styleObj = {
        color: (totalSeconds <= 60 * 10) ? 'orange' : 'black',
        fontSize: '15px',
        textAlign: 'center'
    }

    if (totalSeconds <= 60 * 5) {
        styleObj.color = 'red';
    }

    if (totalSeconds === 0) {
        ReactDOM.render(
            <>
                <div className="token-checking">
                    세션이 만료되었습니다.<br/>
                    새로고침 혹은 재로그인을 해주세요. URL: http://xxx.xxx.xxx.xxx
                    <Spin/>
                </div>
            </>,
            document.getElementById('root'),
        );
    }

    return (
        <div className={'time-count'}>
            <div className="ant-statistic-title">SESSION TIME</div>
            <p style={styleObj}>
                <span>{minutes}</span> : <span>{seconds}</span>
            </p>
        </div>
    )
}

export default Timer;