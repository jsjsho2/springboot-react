import React, {useEffect, useState} from 'react'
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

const Hist = () => {
    const [getDataSignal, setGetDataSignal] = useState(false);
    const [loadings, setLoadings] = useState(true);
    const [returnUpdate, setReturnUpdate] = useState(false);

    const [detailVisible, setDetailVisible] = useState(false);
    const [histList, setHistList] = useState([]);
    const [detailInfo, setDetailInfo] = useState();
    const [detailUuid, setDetailUuid] = useState('');
    const [detailStatus, setDetailStatus] = useState(0);

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

    async function getData() {
        setGetDataSignal(false);
        setLoadings(true);
        const url = "/REST/authority/getUserAuthorityHist";
        const data = await GetData(url, inputs, 'a2');

        setGetDataSignal(true);
        setLoadings(false);

        let returnData = [];
        let rowSpanCheck = 1;

        if (data === undefined) {
            message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
            return false;
        } else {
            if (data.length === 0 || data === '') {
                common.showGridNoRowMsg();
                return false;
            }

            let obj = {};

            for (let i = 0; i < data.length; i++) {
                obj = {
                    targetUuid: data[i].TARGET_UUID,
                    lastModifyDate: common.numberDateToString(data[i].LAST_MODIFY_DATE),
                    rowSpan: 1,
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
    }

    useEffect(() => {
        if (!getDataSignal) {
            common.showGridLoadingMsg();
        } else {
            common.hideGridLoadingMsg();
        }
    }, [getDataSignal]);
    useEffect(() => {
        getData();
    }, []);

    function visibleDetailFunc(visible) {
        setDetailVisible(visible);
    }

    const requestRecall = () => {
        if (detailStatus !== 0) {
            message.warning('이미 결재상신이 만료된 권한 입니다', 2);
            return false;
        }

        const obj = {
            uuid: detailUuid,
            status: 7
        };

        setReturnUpdate(true);
        SetData("/REST/approval/updateApprovalInfo", obj, 'a21', 9)
            .then((data) => {

                if (data) {
                    message.success('결재상신을 취소하였습니다', 2);
                    setDetailVisible(false);
                    getData();
                } else {
                    message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                }
            }).finally(() => {
            setReturnUpdate(false)
        })
    };

    const showDetails = async (uuid) => {
        setDetailVisible(true);

        const data = await GetData('/REST/authority/getRequestOne', {uuid: uuid, type: 'hist'}, 'a21');

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
                                        status[0] = '미승인';
                                        status[1] = 'wait';
                                        break;
                                    case 1:
                                        status[0] = '승인';
                                        status[1] = 'finish';
                                        break;
                                    case 2:
                                        status[0] = '반려';
                                        status[1] = 'error';
                                        break;
                                    case 3:
                                        status[0] = '회수';
                                        status[1] = 'error';
                                        break;
                                    case 4:
                                        status[0] = '반환';
                                        status[1] = 'error';
                                        break;
                                    case 5:
                                        status[0] = '관리자전결';
                                        status[1] = 'finish';
                                        rootApproval[0] = true;
                                        break;
                                }
                            } else {
                                status[0] = '전결처리';
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
                            <td className="title">요청일시</td>
                            <td className="value" colSpan="3">{common.numberDateToString(data[0].REQUEST_TIME)}</td>
                        </tr>
                        <tr>
                            <td className="title" rowSpan="2">요청정보</td>
                            <td className="title">역할명</td>
                            <td className="title">적용일시</td>
                            <td className="title">만료일시</td>
                        </tr>
                        <tr>
                            <td className="value">{<Roles/>}</td>
                            <td className="value">{<Froms/>}</td>
                            <td className="value">{<Tos/>}</td>
                        </tr>
                        <tr>
                            <td className="title">요청사유</td>
                            <td className="value" colSpan="3">{data[0].RSN}</td>
                        </tr>
                        <tr>
                            <td className="title">결재 의견</td>
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
    };

    const CustomColor = (props) => {
        let statusText;
        switch (props.value) {
            case 0:
                statusText = <Tag color="gray">결재진행중</Tag>;
                break;
            case 1:
                statusText = <Tag color="green">적용중</Tag>;
                break;
            case 2:
                statusText = <Tag color="red">반려</Tag>;
                break;
            case 3:
                statusText = <Tag color="red">회수</Tag>;
                break;
            case 4:
                statusText = <Tag color="gray">반환</Tag>;
                break;
            case 5:
                statusText = <Tag color="green">전결</Tag>;
                break;
            case 6:
                statusText = <Tag color="red">만료</Tag>;
                break;
            case 7:
                statusText = <Tag color="gray">상신취소</Tag>;
                break;
            case 8:
                statusText = <Tag color="gray">Default</Tag>;
                break;
            case 9:
                statusText = <Tag color="red">삭제예정</Tag>;
                break;
        }
        return (statusText);
    };

    const Details = (props) => {
        return (
            <CustomButton
                event={showDetails}
                data={props.value}
                icon={'cil-search'}
            />
        )
    };

    const RequestReCallButtons = (
        <Popconfirm
            title="결재상신을 취소하시겠습니까?"
            onConfirm={requestRecall}
            okText="예"
            cancelText="아니오"
        >
            <Button loading={returnUpdate} style={{background: '#ffc107', color: 'white'}}>상신 취소</Button>
        </Popconfirm>
    );
    const frameworkComponents = {
        customColor: CustomColor,
        details: Details
    };
    const colOption = [
        {
            headerName: "동일결재", field: "rowSpan", rowSpan: (params) => {
                return params.data.rowSpan;
            },
            cellClassRules: {'show-cell': 'true'},
            maxWidth: 90,
        },
        {headerName: "최종 수정 일시", field: "lastModifyDate"},
        {headerName: "역할", field: "roleName"},
        {headerName: "적용 일시", field: "from"},
        {headerName: "만료 일시", field: "to"},
        {headerName: "상태", field: "status", cellRenderer: 'customColor'},
        {headerName: "상세보기", field: "targetUuid", cellRenderer: 'details'},
    ];

    function createShowCellRenderer() {
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
    }

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>권한 신청/적용 이력</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol sm={2}>
                                    <CLabel>역할명</CLabel>
                                    <CInput
                                        name="roleName"
                                        onChange={onChange}
                                        className='ant-input'
                                    />
                                </CCol>

                                <CCol className="function-btns" sm={10}>
                                    <Button type='primary' loading={loadings} onClick={getData}>검색</Button>
                                </CCol>
                            </CRow>

                            <CRow className="g-3">
                                <SetAgGrid data={histList}
                                           frameworkComponents={frameworkComponents}
                                           colOption={colOption}
                                           components={{showCellRenderer: createShowCellRenderer()}}
                                />
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Modal
                visible={detailVisible}
                visibleFunc={visibleDetailFunc}
                title='결재 정보'
                content={detailInfo}
                type='modal-big-size'
                buttons={RequestReCallButtons}
            />
        </>
    )
};

export default Hist;