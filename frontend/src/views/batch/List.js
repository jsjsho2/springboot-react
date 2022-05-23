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
                message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                return false;
            } else if (data.length === 0 || data === '') {
                common.showGridNoRowMsg();
            } else {
                common.hideGridNoRowMsg();

                for (let i = 0; i < data.length; i++) {
                    let cron = '';

                    if (data[i].EXE_TYPE === 'every') {
                        const batchTime = data[i].EVERY.split(' ');
                        cron = `매일 ${batchTime[2]}시 ${batchTime[1]}분 ${batchTime[0]}초`;
                    } else {
                        const batchTime = data[i].SPECIFIC.split(' ');
                        cron = `${batchTime[4]}월 ${batchTime[3]}일 ${batchTime[2]}시 ${batchTime[1]}분 ${batchTime[0]}초`;
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
                message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
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
                message.warning("배치명을 입력해주세요", 2);
                return;
            }

            if (common.requiredCheck(batchInfo.batchType === 'sql' ? batchInfo.sql : batchInfo.fileName)) {
                message.warning("배치 SQL or 파일명을 입력해주세요", 2);
                return;
            }

            if (common.requiredCheck(batchInfo.exeType === 'every' ? batchInfo.every : batchInfo.specific)) {
                message.warning("동작시간을 입력해주세요", 2);
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
                        message.success('등록완료', 2);
                        fn.visible.addBatch(false);
                        fn.getData();
                    } else {
                        message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                    }
                }).finally(() => {
                setBatchInserting(false);
            });
        },
        updateBatch: () => {
            if (common.requiredCheck(batchInfo.name)) {
                message.warning("배치명을 입력해주세요", 2);
                return;
            }

            if (common.requiredCheck(batchInfo.batchType === 'sql' ? batchInfo.sql : batchInfo.fileName)) {
                message.warning("배치 SQL or 파일명을 입력해주세요", 2);
                return;
            }

            if (common.requiredCheck(batchInfo.exeType === 'every' ? batchInfo.every : batchInfo.specific)) {
                message.warning("동작시간을 입력해주세요", 2);
                return;
            }

            batchInfo.every = batchInfo.every !== '' ? moment(batchInfo.every, 'HH:mm:ss').format(everyFormat) : '';
            batchInfo.specific = batchInfo.specific !== '' ? moment(batchInfo.specific).format(specificFormat) : '';

            setBatchUpdating(true);
            SetData("/REST/batch/updateBatch", batchInfo, 'd01', 2)
                .then((data) => {
                    if (data) {
                        message.success('저장완료', 2);
                        setBatchVisible(false);
                        fn.getData();
                    } else {
                        message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
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
                        message.success('배치를 실행하였습니다', 2);
                        setBatchVisible(false);
                    } else {
                        message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
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
                    statusTag = <Tag color="green">성공</Tag>;
                    break;
                case 1:
                    statusTag = <Tag color="red">실패</Tag>;
                    break;
                case 2:
                    statusTag = <Tag color="gray">진행중</Tag>;
                    break;
                default:
                    statusTag = <Tag color="gray">미실행</Tag>;
                    break;
            }
            return (statusTag);
        },
        UsageCustomColor: props => {
            const statusTag = parseInt(props.value) === 0
                ? <Tag color="green">사용</Tag>
                : <Tag color="red">미사용</Tag>;

            return (statusTag);
        },
        colOption: [
            {headerName: "배치명", field: 'name'},
            {headerName: "배치 동작 시간", field: 'cron'},
            {headerName: "마지막 동작 시작일시", field: 'start'},
            {headerName: "마지막 동작 종료일시", field: 'end'},
            {headerName: "마지막 동작 상태", field: 'status', cellRenderer: 'stateCustomColor'},
            {headerName: "사용", field: "usage", cellRenderer: 'usageCustomColor'},
            {headerName: "상세보기", field: "uuid", cellRenderer: 'details'},
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
                }}>닫기
                </Button>
                <Popconfirm
                    title="저장된 내용으로 배치를 수동 실행하시겠습니까?"
                    onConfirm={fn.manualBatchInit}
                    okText="예"
                    cancelText="아니오"
                >
                    <Button type="primary" loading={batchIniting}>수동 실행</Button>
                </Popconfirm>
                <Popconfirm
                    title="해당 내용으로 저장하시겠습니까?"
                    onConfirm={fn.updateBatch}
                    okText="예"
                    cancelText="아니오"
                >
                    <Button type="primary" loading={batchUpdating}>저장</Button>
                </Popconfirm>
            </div>
        ),
        addBatch: (
            <div key={'buttons'}>
                <Button onClick={() => {
                    fn.visible.addBatch(false);
                }}>닫기
                </Button>
                <Popconfirm
                    title="해당 내용으로 배치 정보를 등록하시겠습니까?"
                    onConfirm={fn.insertBatch}
                    okText="예"
                    cancelText="아니오"
                >
                    <Button type="primary" loading={batchInserting}>저장</Button>
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
                            <strong>배치 목록</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol className="function-btns" sm={12}>
                                    <Button type="primary" loading={loadings} onClick={fn.getData}>
                                        검색
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
                                    }}>등록</Button>
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
                title='배치 정보'
                content={<BatchDetailInfoLayout data={batchInfo} onChange={propsValue}/>}
                buttons={modalButtons.batchInfo}
                type='modal-middle-size'
            />

            <Modal
                visible={addBatchVisible}
                visibleFunc={fn.visible.addBatch}
                title='배치 등록'
                content={<BatchDetailInfoLayout data={batchInfo} onChange={propsValue}/>}
                buttons={modalButtons.addBatch}
                type='modal-middle-size'
            />
        </>
    )
};

export default List;