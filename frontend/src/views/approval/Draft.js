import React, {useEffect, useRef, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CInput, CLabel, CRow,} from '@coreui/react'
import * as common from '../../components/CommonFunction';
import SetAgGrid from "../../components/SetAgGrid";
import CustomButton from "../../components/CustomButton";
import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import SetData from "../../ajax/SetData";
import {Button, message, Popconfirm, Steps, Tag} from "antd";
import {UserOutlined} from '@ant-design/icons';

const {Step} = Steps;

const Draft = () => {
    const [getDataSignal, setGetDataSignal] = useState(false);
    const [loadings, setLoadings] = useState(true);
    const [returnUpdate, setReturnUpdate] = useState(false);

    const [detailVisible, setDetailVisible] = useState(false);
    const [detailInfo, setDetailInfo] = useState();
    const [detailUuid, setDetailUuid] = useState('');
    const [detailStatus, setDetailStatus] = useState(0);
    const [histList, setHistList] = useState([]);

    const btnRef = useRef(null);

    const [inputs, setInputs] = useState({
        roleName: '',
    });
    const onChange = (e) => {
        const {name, value} = e.target;

        const nextInputs = {
            ...inputs,
            [name]: value,
        };
        setInputs(nextInputs)
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
            detail: visible => {
                setDetailVisible(visible);
            },
        },
        getData: async () => {
            setGetDataSignal(false);
            setLoadings(true);

            const data = await GetData(`/REST/approval/getApprovalHistList`, inputs, 'b1');

            setGetDataSignal(true);
            setLoadings(false);

            let returnData = [];
            let rowSpanCheck = 1;

            if (data === undefined) {
                message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                return false;
            } else if (data.length === 0 || data === '') {
                common.showGridNoRowMsg();
            } else {
                common.hideGridNoRowMsg();
                let obj = {};

                for (let i = 0; i < data.length; i++) {
                    obj = {
                        targetUuid: data[i].TARGET_UUID,
                        lastModifyDate: common.numberDateToString(data[i].LAST_MODIFY_DATE),
                        rowSpan: 1,
                        targetInfo: `${data[i].NAME}(${data[i].USER_ID})`
                    };

                    const roleId = data[i].ROLE_ID;
                    const roleName = data[i].ROLE_NAME;
                    const from = common.numberDateToString(data[i].FROM_DATE);
                    const to = common.numberDateToString(data[i].TO_DATE);
                    const status = parseInt(data[i].STATUS);

                    if (i + 1 !== data.length) {
                        if (data[i].TARGET_UUID !== data[i + 1].TARGET_UUID) {
                            fillObject(obj, roleId, roleName, from, to, status);
                            setRowSpan(i);
                        } else {
                            fillObject(obj, roleId, roleName, from, to, status);
                            rowSpanCheck++;
                        }
                    } else {
                        fillObject(obj, roleId, roleName, from, to, status);
                        setRowSpan(i);
                    }

                    returnData.push(obj);
                }
            }

            function setRowSpan(i) {
                if (rowSpanCheck !== 1) {
                    const idx = (i + 1) - rowSpanCheck;
                    returnData[idx].rowSpan = rowSpanCheck;
                    rowSpanCheck = 1;
                }
            }

            function fillObject(obj, roleId, roleName, from, to, status) {
                obj['roleId'] = roleId;
                obj['roleName'] = roleName;
                obj['from'] = from;
                obj['to'] = to;
                obj['status'] = status;
            }

            setHistList(returnData);
        },
        showDetails: async uuid => {

            if (uuid === null || uuid === 'null') {
                message.info(`????????? Default ????????? ??????????????? ????????????`, 2);
                return false;
            }

            setDetailVisible(true);

            const data = await GetData('/REST/authority/getRequestOne', {uuid: uuid, type: 'hist'}, 'b11');

            setDetailUuid(uuid);
            setDetailStatus(parseInt(data[0].STATUS));

            const flow = JSON.parse(data[0].FLOW);
            const requestInfo = JSON.parse(data[0].REQUEST_INFO);
            const rootApproval = [false, false];
            const BrCheck = (index, value) => {
                return (
                    <div key={common.createUuid()}>
                        {index !== 0
                            ? <br/>
                            : ''}
                        {value}
                    </div>
                )
            };
            const Roles = () => {
                return (<>
                    {requestInfo.map((value, index) => (
                        BrCheck(index, value.name)
                    ))}
                </>)
            };
            const Froms = () => {
                return (<>
                    {requestInfo.map((value, index) => (
                        BrCheck(index, common.numberDateToString(value.from))
                    ))}
                </>)
            };
            const Tos = () => {
                return (<>
                    {requestInfo.map((value, index) => (
                        BrCheck(index, common.numberDateToString(value.to))
                    ))}
                </>)
            };

            const ApprovalSteps = (props) => {
                return (
                    <>
                        <Steps type="navigation">
                            {props.data && props.data.map((value, index) => {
                                let status = [];

                                if (!rootApproval[1]) {
                                    switch (parseInt(value.status)) {
                                        case 0:
                                            status[0] = '?????????';
                                            status[1] = 'wait';
                                            break;
                                        case 1:
                                            status[0] = '??????';
                                            status[1] = 'finish';
                                            break;
                                        case 2:
                                            status[0] = '??????';
                                            status[1] = 'error';
                                            break;
                                        case 3:
                                            status[0] = '??????';
                                            status[1] = 'error';
                                            break;
                                        case 4:
                                            status[0] = '??????';
                                            status[1] = 'error';
                                            break;
                                        case 5:
                                            status[0] = '???????????????';
                                            status[1] = 'finish';
                                            rootApproval[0] = true;
                                            break;
                                    }
                                } else {
                                    status[0] = '????????????';
                                    status[1] = 'finish';
                                }

                                if (rootApproval[0] === true) {
                                    rootApproval[1] = true;
                                }

                                const icon = <UserOutlined/>;
                                const description = parseInt(value.status) !== 0
                                    ? (<>{status[0]}<br/>{common.numberDateToString(value.date)}</>)
                                    : (<>{status[0]}</>);

                                return <Step key={index} status={status[1]} title={value.name}
                                             description={description} icon={icon}/>
                            })}
                        </Steps>
                    </>
                )
            };

            const ApprovalDetails = (
                <div className='approval-detail-content'>
                    <div className={'limit-max-width'}>
                        <ApprovalSteps data={flow}/>
                    </div>

                    <div className='approval-info' style={{marginTop: '15px'}}>
                        <table className="approval-detail-table">
                            <tbody>
                            <tr>
                                <td className="title">????????????</td>
                                <td className="value" colSpan="3">{common.numberDateToString(data[0].REQUEST_TIME)}</td>
                            </tr>
                            <tr>
                                <td className="title" rowSpan="2">????????????</td>
                                <td className="title">?????????</td>
                                <td className="title">????????????</td>
                                <td className="title">????????????</td>
                            </tr>
                            <tr>
                                <td className="value">{<Roles/>}</td>
                                <td className="value">{<Froms/>}</td>
                                <td className="value">{<Tos/>}</td>
                            </tr>
                            <tr>
                                <td className="title">????????????</td>
                                <td className="value" colSpan="3">{data[0].RSN}</td>
                            </tr>
                            <tr>
                                <td className="title">?????? ??????</td>
                                <td className="title" colSpan="3">comment</td>
                            </tr>
                            {flow.map((value, index) => (
                                <tr key={`${index}-0`}>
                                    <td key={`${index}-1`} className="title">{value.name}</td>
                                    <td key={`${index}-2`} className="value" colSpan="3">{value.rsn}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );

            setDetailInfo(ApprovalDetails);
        },
        requestRecall: () => {
            if (detailStatus !== 0) {
                message.warning('?????? ??????????????? ????????? ?????? ?????????', 2);
                return false;
            }

            const obj = {
                uuid: detailUuid,
                status: 7
            };

            setReturnUpdate(true);
            SetData("/REST/approval/updateApprovalInfo", obj, 'b12', 9)
                .then((data) => {

                    if (data) {
                        message.success('??????????????? ?????????????????????', 2);
                        setDetailVisible(false);
                        fn.getData();
                    } else {
                        message.error('[ERROR] ????????? ?????? ???????????? ??????????????? ??????????????????', 2);
                    }
                }).finally(() => {
                setReturnUpdate(false)
            })
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
    }

    const grid = {
        CustomColor: props => {
            let statusText;
            switch (props.value) {
                case 0:
                    statusText = <Tag color="gray">???????????????</Tag>;
                    break;
                case 1:
                    statusText = <Tag color="green">?????????</Tag>;
                    break;
                case 2:
                    statusText = <Tag color="red">??????</Tag>;
                    break;
                case 3:
                    statusText = <Tag color="red">??????</Tag>;
                    break;
                case 4:
                    statusText = <Tag color="gray">??????</Tag>;
                    break;
                case 5:
                    statusText = <Tag color="green">??????</Tag>;
                    break;
                case 6:
                    statusText = <Tag color="red">??????</Tag>;
                    break;
                case 7:
                    statusText = <Tag color="gray">????????????</Tag>;
                    break;
                case 8:
                    statusText = <Tag color="gray">Default</Tag>;
                    break;
                case 9:
                    statusText = <Tag color="red">????????????</Tag>;
                    break;
            }
            return (statusText);
        },
        createShowCellRenderer: () => {
            function ShowCellRenderer() {

            }

            ShowCellRenderer.prototype.init = function (params) {
                const cellBlank = !params.value;
                if (cellBlank) {
                    return null;
                }
            };
            ShowCellRenderer.prototype.getGui = function () {
                return this.ui;
            };
            return ShowCellRenderer;
        },
        colOption: [
            {
                headerName: "????????????", field: "rowSpan", rowSpan: (params) => {
                    return params.data.rowSpan;
                },
                cellClassRules: {'show-cell': 'true'},
                maxWidth: 90,
            },
            {headerName: "?????? ?????? ??????", field: "lastModifyDate"},
            {headerName: "??????", field: "roleName"},
            {headerName: "?????? ??????", field: "from"},
            {headerName: "?????? ??????", field: "to"},
            {headerName: "??????", field: "status", cellRenderer: 'customColor'},
            {headerName: "????????????", field: "targetUuid", cellRenderer: 'details'},
        ],
    };

    const frameworkComponents = {
        customColor: grid.CustomColor,
        details: fn.Details
    };

    const modalButtons = {
        requestRecall: (
            <Popconfirm
                title="??????????????? ?????????????????????????"
                onConfirm={fn.requestRecall}
                okText="???"
                cancelText="?????????"
            >
                <Button loading={returnUpdate} style={{background: '#ffc107', color: 'white'}}>?????? ??????</Button>
            </Popconfirm>
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
                            <CRow className="g-3" onKeyPress={e => {
                                if (e.key === 'Enter') {
                                    btnRef.current.dispatchEvent(new Event('click', {bubbles: true}));
                                }
                            }}>
                                <CCol sm={2}>
                                    <CLabel>?????????</CLabel>
                                    <CInput
                                        name="roleName"
                                        onChange={onChange}
                                        className='ant-input'
                                    />
                                </CCol>

                                <CCol className="function-btns" sm={10}>
                                    <Button type='primary' loading={loadings} onClick={fn.getData}
                                            ref={btnRef}>??????</Button>
                                </CCol>
                            </CRow>

                            <CRow className="g-3">
                                <SetAgGrid data={histList}
                                           frameworkComponents={frameworkComponents}
                                           colOption={grid.colOption}
                                           components={{showCellRenderer: grid.createShowCellRenderer()}}
                                />
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Modal
                visible={detailVisible}
                visibleFunc={fn.visible.detail}
                title='?????? ??????'
                content={detailInfo}
                type='modal-big-size'
                buttons={modalButtons.requestRecall}
            />
        </>
    )
};

export default Draft;