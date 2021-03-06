import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CCollapse,
    CFormText,
    CInput,
    CLabel,
    CListGroup,
    CListGroupItem,
    CRow
} from "@coreui/react";
import React, {useState} from "react";
import {Button, message, Popconfirm} from "antd";
import useStore from "../../store/store";
import SetData from "../../ajax/SetData";

const Console = () => {
    const {
        sessionTime,
        redirectUrl,
        headerNameAndTitle,
        footerMsgLeft,
        footerMsgRight,
        batchPath,
        gridRowStack,
        gridHeight,
        updateConfig
    } = useStore();
    const [settingUpdating, setSettingUpdating] = useState(false);
    const [inputs, setInputs] = useState({
        sessionTime: ['session', 'time', sessionTime],
        redirectUrl: ['session', 'time', redirectUrl],
        headerNameAndTitle: ['layout', 'header', headerNameAndTitle],
        footerMsgLeft: ['layout', 'footer', footerMsgLeft],
        footerMsgRight: ['layout', 'footer', footerMsgRight],
        gridRowStack: ['global', 'grid', gridRowStack],
        gridHeight: ['global', 'grid', gridHeight],
        batchPath: ['batch', 'path', batchPath],
    });
    const [collapse, setCollapse] = useState({
        session: false,
        header: false,
        footer: false,
        global: false,
        batch: false,
    });

    const onChange = e => {
        const {name, value} = e.target;
        const copy = [...inputs[name]];
        copy[2] = value;
        const nextInputs = {
            ...inputs,
            [name]: copy,
        };

        setInputs(nextInputs)
    };
    const toggle = target => {
        const copy = collapse[target];

        const nextCollapse = {
            ...collapse,
            [target]: !copy,
        };

        setCollapse(nextCollapse);
    };

    const fn = {
        updateSetting: () => {
            setSettingUpdating(true);

            SetData("/REST/setting/updateConsoleConfig", inputs, 'f0', 2)
                .then((data) => {
                    if (data) {
                        message.success('????????????', 2);
                    } else {
                        message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                    }
                }).finally(() => {

                setSettingUpdating(false);

                for (const key in inputs) {
                    const obj = {
                        KEY: key,
                        VALUE: inputs[key][2]
                    };

                    updateConfig(obj);
                }
            });
        }
    };

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>?????? ??????</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol className="function-btns" sm={12}>
                                    <Popconfirm
                                        title="?????????????????????????"
                                        onConfirm={fn.updateSetting}
                                        okText="???"
                                        cancelText="?????????"
                                    >
                                        <Button type="primary" loading={settingUpdating}>??????</Button>
                                    </Popconfirm>
                                </CCol>
                            </CRow>

                            {/*session*/}
                            <CListGroup>
                                <CListGroupItem className={'list-group-accordion'}>
                                    <div className={'list-group-accordion-pointer'}
                                         onClick={() => {
                                             toggle('session')
                                         }}
                                    >
                                        Session Time
                                    </div>
                                    <CCollapse show={collapse.session}>
                                        <CCardBody>
                                            <div className="mb-3">
                                                <CLabel>?????? ?????? ???????????? (sec)</CLabel>
                                                <CInput type="text" name='sessionTime'
                                                        value={inputs.sessionTime[2]}
                                                        onChange={(e) => {
                                                            onChange(e);
                                                        }}/>
                                            </div>
                                        </CCardBody>
                                    </CCollapse>
                                    <CCollapse show={collapse.session}>
                                        <CCardBody>
                                            <div className="mb-3">
                                                <CLabel>Redirect URL</CLabel>
                                                <CInput type="text" name='redirectUrl'
                                                        value={inputs.redirectUrl[2]}
                                                        onChange={(e) => {
                                                            onChange(e);
                                                        }}/>
                                            </div>
                                        </CCardBody>
                                    </CCollapse>
                                </CListGroupItem>
                            </CListGroup>

                            {/*header*/}
                            <CListGroup>
                                <CListGroupItem className={'list-group-accordion'}>
                                    <div className={'list-group-accordion-pointer'}
                                         onClick={() => {
                                             toggle('header')
                                         }}
                                    >
                                        Layout Header
                                    </div>
                                    <CCollapse show={collapse.header}>
                                        <CCardBody>
                                            <div className="mb-3">
                                                <CLabel>Header ?????? ?????? ???, Title</CLabel>
                                                <CInput type="text" name='headerNameAndTitle'
                                                        value={inputs.headerNameAndTitle[2]}
                                                        onChange={(e) => {
                                                            onChange(e);
                                                        }}/>
                                            </div>
                                        </CCardBody>
                                    </CCollapse>
                                </CListGroupItem>
                            </CListGroup>

                            {/*footer*/}
                            <CListGroup>
                                <CListGroupItem className={'list-group-accordion'}>
                                    <div className={'list-group-accordion-pointer'}
                                         onClick={() => {
                                             toggle('footer')
                                         }}
                                    >
                                        Layout Footer
                                    </div>
                                    <CCollapse show={collapse.footer}>
                                        <CCardBody>
                                            <div className="mb-3">
                                                <CLabel>Footer ?????? ?????????</CLabel>
                                                <CInput type="text" name='footerMsgLeft'
                                                        value={inputs.footerMsgLeft[2]}
                                                        onChange={(e) => {
                                                            onChange(e);
                                                        }}/>
                                            </div>
                                            <div className="mb-3">
                                                <CLabel>Footer ?????? ?????????</CLabel>
                                                <CInput type="text" name='footerMsgRight'
                                                        value={inputs.footerMsgRight[2]}
                                                        onChange={(e) => {
                                                            onChange(e);
                                                        }}/>
                                            </div>
                                        </CCardBody>
                                    </CCollapse>
                                </CListGroupItem>
                            </CListGroup>

                            {/*global*/}
                            <CListGroup>
                                <CListGroupItem className={'list-group-accordion'}>
                                    <div className={'list-group-accordion-pointer'}
                                         onClick={() => {
                                             toggle('global')
                                         }}
                                    >
                                        Global Grid
                                    </div>
                                    <CCollapse show={collapse.global}>
                                        <CCardBody>
                                            <div className="mb-3">
                                                <CLabel>Grid ???????????? Row ?????? ??? (0 ~ n)</CLabel>
                                                <CInput type="text" name='gridRowStack'
                                                        value={inputs.gridRowStack[2]}
                                                        onChange={(e) => {
                                                            onChange(e);
                                                        }}/>
                                            </div>
                                        </CCardBody>
                                    </CCollapse>
                                    <CCollapse show={collapse.global}>
                                        <CCardBody>
                                            <div className="mb-3">
                                                <CLabel>Grid ??? ????????? ????????? Row ??? (scroll bar ?????? ?????? ????????? row ???)</CLabel>
                                                <CInput type="text" name='gridHeight'
                                                        value={inputs.gridHeight[2]}
                                                        onChange={(e) => {
                                                            onChange(e);
                                                        }}/>
                                            </div>
                                        </CCardBody>
                                    </CCollapse>
                                </CListGroupItem>
                            </CListGroup>

                            {/*menu-batch*/}
                            <CListGroup>
                                <CListGroupItem className={'list-group-accordion'}>
                                    <div className={'list-group-accordion-pointer'}
                                         onClick={() => {
                                             toggle('batch')
                                         }}
                                    >
                                        Menu Batch
                                    </div>
                                    <CCollapse show={collapse.batch}>
                                        <CCardBody>
                                            <div className="mb-3">
                                                <CLabel htmlFor="batchPath">?????? ?????? ?????? ??????</CLabel>
                                                <CInput id="batchPath" aria-describedby="batchPathText"
                                                        name='batchPath' value={inputs.batchPath[2]} onChange={(e) => {
                                                    onChange(e);
                                                }}/>
                                                <CFormText id="batchPathText">
                                                    ?????? library??? ?????? ????????? ?????????/????????? ??????
                                                </CFormText>
                                            </div>
                                        </CCardBody>
                                    </CCollapse>
                                </CListGroupItem>
                            </CListGroup>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default Console;