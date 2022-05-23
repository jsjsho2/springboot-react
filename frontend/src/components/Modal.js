import React from 'react';
import 'antd/dist/antd.css';
import {Modal} from 'antd';

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
                    <div>{modal}</div>
                )}
                footer={props.buttons}
            >
                <div>{props.content}</div>
            </Modal>
        </>
    );
};

export default DragModal;