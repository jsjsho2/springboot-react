import React from 'react';
import 'antd/dist/antd.css';
import {Modal} from 'antd';
import Draggable from 'react-draggable';
import PropTypes from "prop-types";

const DragModal = (props) => {

    return (
        <>
            <Modal
                title={
                    <div style={{width: '100%', cursor: 'move'}}>{props.title}</div>
                }
                visible={props.visible}
                onOk={() => props.visibleFunc(false)}
                onCancel={() => props.visibleFunc(false)}
                className={props.hasOwnProperty('type') ? props.type : 'modal-plain-size'}
                style={{top: '15%'}}
                cancelText={'닫기'}
                okText={'확인'}
                destroyOnClose={true}
                modalRender={(modal) => (
                    <Draggable>
                        <div>{modal}</div>
                    </Draggable>
                )}
                footer={props.buttons}
            >
                <div>{props.content}</div>
            </Modal>
        </>
    );
};

export default DragModal;

DragModal.propTypes = {
    type: PropTypes.any,
    visibleFunc: PropTypes.any,
    visible: PropTypes.any,
    title: PropTypes.any,
    content: PropTypes.any,
    buttons: PropTypes.any,
};
