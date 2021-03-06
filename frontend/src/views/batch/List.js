import React, {useEffect, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CRow,} from '@coreui/react'
import * as common from '../../components/CommonFunction';
import SetAgGrid from "../../components/SetAgGrid";
import CustomButton from "../../components/CustomButton";
import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import SetData from "../../ajax/SetData";
import BatchDetailInfoLayout from "../../components/BatchDetailInfoLayout";
import {Button, message, Popconfirm, Tag} from "antd";
import moment from "moment";

const everyFormat = 'ss mm HH * * ?';
const specificFormat = 'ss mm HH DD MM ?';

const List = () => {
    const [getDataSignal, setGetDataSignal] = useState(false);
    const [loadings, setLoadings] = useState(true);
    const [batchUpdating, setBatchUpdating] = useState(false);
    const [batchInserting, setBatchInserting] = useState(false);
    const [batchIniting, setBatchIniting] = useState(false);

    const [batchVisible, setBatchVisible] = useState(false);
    const [addBatchVisible, setAddBatchVisible] = useState(false);

    const [batchList, setBatchList] = useState([]);
    const [batchInfo, setBatchInfo] = useState({});

    const propsValue = (e) => {
        setBatchInfo(e);
    };

    useEffect(() => {
        if (!getDataSignal) {
            common.showGridLoadingMsg();
        } else {
            common.hideGridLoadingMsg();
        }
    }, [getDataSignal]);
    useEffect(() => {
        fn.getData();
    }, []);


    const fn = {
        visible: {
            batch: visible => {
                setBatchVisible(visible);
            },
            addBatch: visible => {
                setAddBatchVisible(visible);
            },
        },
        getData: async () => {
            setGetDataSignal(false);
            setLoadings(true);

            const data = await GetData('/REST/batch/getBatchList', {}, 'd0');
            let returnData = [];
            setLoadings(false);
            setGetDataSignal(true);

            if (data === undefined) {
                message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                return false;
            } else if (data.length === 0 || data === '') {
                common.showGridNoRowMsg();
            } else {
                common.hideGridNoRowMsg();

                for (let i = 0; i < data.length; i++) {
                    let cron = '';

                    if (data[i].EXE_TYPE === 'every') {
                        const batchTime = data[i].EVERY.split(' ');
                        cron = `?????? ${batchTime[2]}??? ${batchTime[1]}??? ${batchTime[0]}???`;
                    } else {
                        const batchTime = data[i].SPECIFIC.split(' ');
                        cron = `${batchTime[4]}??? ${batchTime[3]}??? ${batchTime[2]}??? ${batchTime[1]}??? ${batchTime[0]}???`;
                    }

                    const obj = {
                        uuid: data[i].UUID,
                        name: data[i].NAME,
                        cron: cron,
                        start: data[i].START_DATE != null ? common.numberDateToString(data[i].START_DATE) : '',
                        end: data[i].END_DATE != null ? common.numberDateToString(data[i].END_DATE) : '',
                        status: parseInt(data[i].STATUS),
                        usage: data[i].USAGE,
                        type: 2
                    };

                    returnData.push(obj);
                }
            }

            setBatchList(returnData);
        },
        Details: props => {
            return (
                <CustomButton
                    event={fn.showDetails}
                    data={props.value}
                    icon={'cil-search'}
                />
            )
        },
        showDetails: async uuid => {
            const data = await GetData("/REST/batch/getBatchInfo", {uuid: uuid}, 'd01');

            if (data === undefined) {
                message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                return false;
            } else {
                const batchInfos = {
                    uuid: data[0].UUID,
                    name: data[0].NAME,
                    batchType: data[0].BATCH_TYPE,
                    sql: data[0].SQL || '',
                    fileName: data[0].FILE_NAME || '',
                    exeType: data[0].EXE_TYPE,
                    every: data[0].EVERY || '',
                    specific: data[0].SPECIFIC || '',
                    usage: data[0].USAGE,
                };

                if (batchInfos.every !== '') {
                    const batchEvery = batchInfos.every.split(' ');
                    batchInfos.every = `${batchEvery[2]}:${batchEvery[1]}:${batchEvery[0]}`;
                }

                if (batchInfos.specific !== '') {
                    const batchSpecific = batchInfos.specific.split(' ');
                    batchInfos.specific = `/${batchSpecific[4]}/${batchSpecific[3]} ${batchSpecific[2]}:${batchSpecific[1]}:${batchSpecific[0]}`;
                }

                setBatchInfo(batchInfos);
                setBatchVisible(true);
            }
        },
        insertBatch: () => {
            if (common.requiredCheck(batchInfo.name)) {
                message.warning("???????????? ??????????????????", 2);
                return;
            }

            if (common.requiredCheck(batchInfo.batchType === 'sql' ? batchInfo.sql : batchInfo.fileName)) {
                message.warning("?????? SQL or ???????????? ??????????????????", 2);
                return;
            }

            if (common.requiredCheck(batchInfo.exeType === 'every' ? batchInfo.every : batchInfo.specific)) {
                message.warning("??????????????? ??????????????????", 2);
                return;
            }

            if (batchInfo.exeType === 'every') {
                batchInfo.every = batchInfo.every !== '' ? moment(batchInfo.every, 'HH:mm:ss').format(everyFormat) : '';
            } else {
                batchInfo.specific = batchInfo.specific !== '' ? moment(batchInfo.specific).format(specificFormat) : '';
            }

            setBatchInserting(true);
            SetData("/REST/batch/insertBatch", batchInfo, 'd0', 1)
                .then((data) => {
                    if (data) {
                        message.success('????????????', 2);
                        fn.visible.addBatch(false);
                        fn.getData();
                    } else {
                        message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                    }
                }).finally(() => {
                setBatchInserting(false);
            });
        },
        updateBatch: () => {
            if (common.requiredCheck(batchInfo.name)) {
                message.warning("???????????? ??????????????????", 2);
                return;
            }

            if (common.requiredCheck(batchInfo.batchType === 'sql' ? batchInfo.sql : batchInfo.fileName)) {
                message.warning("?????? SQL or ???????????? ??????????????????", 2);
                return;
            }

            if (common.requiredCheck(batchInfo.exeType === 'every' ? batchInfo.every : batchInfo.specific)) {
                message.warning("??????????????? ??????????????????", 2);
                return;
            }

            batchInfo.every = batchInfo.every !== '' ? moment(batchInfo.every, 'HH:mm:ss').format(everyFormat) : '';
            batchInfo.specific = batchInfo.specific !== '' ? moment(batchInfo.specific).format(specificFormat) : '';

            setBatchUpdating(true);
            SetData("/REST/batch/updateBatch", batchInfo, 'd01', 2)
                .then((data) => {
                    if (data) {
                        message.success('????????????', 2);
                        setBatchVisible(false);
                        fn.getData();
                    } else {
                        message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                    }
                }).finally(() => {
                setBatchUpdating(false);
            });
        },
        manualBatchInit: () => {
            setBatchIniting(true);
            SetData("/REST/batch/manualBatchRun", batchInfo, 'd01', 4)
                .then((data) => {
                    if (data) {
                        message.success('????????? ?????????????????????', 2);
                        setBatchVisible(false);
                    } else {
                        message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                    }
                }).finally(() => {
                setBatchIniting(false);
                fn.getData();
            });
        }
    };

    const grid = {
        StateCustomColor: props => {
            let statusTag;
            switch (props.value) {
                case 0:
                    statusTag = <Tag color="green">??????</Tag>;
                    break;
                case 1:
                    statusTag = <Tag color="red">??????</Tag>;
                    break;
                case 2:
                    statusTag = <Tag color="gray">?????????</Tag>;
                    break;
                default:
                    statusTag = <Tag color="gray">?????????</Tag>;
                    break;
            }
            return (statusTag);
        },
        UsageCustomColor: props => {
            const statusTag = parseInt(props.value) === 0
                ? <Tag color="green">??????</Tag>
                : <Tag color="red">?????????</Tag>;

            return (statusTag);
        },
        colOption: [
            {headerName: "?????????", field: 'name'},
            {headerName: "?????? ?????? ??????", field: 'cron'},
            {headerName: "????????? ?????? ????????????", field: 'start'},
            {headerName: "????????? ?????? ????????????", field: 'end'},
            {headerName: "????????? ?????? ??????", field: 'status', cellRenderer: 'stateCustomColor'},
            {headerName: "??????", field: "usage", cellRenderer: 'usageCustomColor'},
            {headerName: "????????????", field: "uuid", cellRenderer: 'details'},
        ]
    };

    const frameworkComponents = {
        stateCustomColor: grid.StateCustomColor,
        usageCustomColor: grid.UsageCustomColor,
        details: fn.Details
    };

    const modalButtons = {
        batchInfo: (
            <div key={'buttons'}>
                <Button onClick={() => {
                    fn.visible.batch(false)
                }}>??????
                </Button>
                <Popconfirm
                    title="????????? ???????????? ????????? ?????? ?????????????????????????"
                    onConfirm={fn.manualBatchInit}
                    okText="???"
                    cancelText="?????????"
                >
                    <Button type="primary" loading={batchIniting}>?????? ??????</Button>
                </Popconfirm>
                <Popconfirm
                    title="?????? ???????????? ?????????????????????????"
                    onConfirm={fn.updateBatch}
                    okText="???"
                    cancelText="?????????"
                >
                    <Button type="primary" loading={batchUpdating}>??????</Button>
                </Popconfirm>
            </div>
        ),
        addBatch: (
            <div key={'buttons'}>
                <Button onClick={() => {
                    fn.visible.addBatch(false);
                }}>??????
                </Button>
                <Popconfirm
                    title="?????? ???????????? ?????? ????????? ?????????????????????????"
                    onConfirm={fn.insertBatch}
                    okText="???"
                    cancelText="?????????"
                >
                    <Button type="primary" loading={batchInserting}>??????</Button>
                </Popconfirm>
            </div>
        )
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
                                    <Button type="primary" loading={loadings} onClick={fn.getData}>
                                        ??????
                                    </Button>
                                    <Button type="primary" onClick={() => {
                                        setBatchInfo({
                                            uuid: common.createUuid(),
                                            name: '',
                                            batchType: 'sql',
                                            sql: '',
                                            fileName: '',
                                            exeType: 'every',
                                            every: '',
                                            specific: '',
                                            usage: true,
                                        });
                                        fn.visible.addBatch(true)
                                    }}>??????</Button>
                                </CCol>
                            </CRow>

                            <CRow className="g-3">
                                <SetAgGrid data={batchList}
                                           frameworkComponents={frameworkComponents}
                                           colOption={grid.colOption}
                                />
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Modal
                visible={batchVisible}
                visibleFunc={fn.visible.batch}
                title='?????? ??????'
                content={<BatchDetailInfoLayout data={batchInfo} onChange={propsValue}/>}
                buttons={modalButtons.batchInfo}
                type='modal-middle-size'
            />

            <Modal
                visible={addBatchVisible}
                visibleFunc={fn.visible.addBatch}
                title='?????? ??????'
                content={<BatchDetailInfoLayout data={batchInfo} onChange={propsValue}/>}
                buttons={modalButtons.addBatch}
                type='modal-middle-size'
            />
        </>
    )
};

export default List;