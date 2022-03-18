import React, {useEffect, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CCollapse, CRow,} from '@coreui/react'
import * as common from '../../components/CommonFunction';
import SetAgGrid from "../../components/SetAgGrid";
import CustomButton from "../../components/CustomButton";
import TreeDataViewerSelect from "../../components/TreeDataViewerSelect";
import TreeDataViewer from "../../components/TreeDataViewer";
import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import SetData from "../../ajax/SetData";
import {FileTextOutlined, SmileOutlined, UserOutlined,} from '@ant-design/icons';
import {Button, DatePicker, Form, Input, message, Popconfirm, Steps} from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';

const {Step} = Steps;

const Request = () => {
    const [getDataSignal, setGetDataSignal] = useState(false);
    const [requestUpdate, setRequestUpdate] = useState(false);
    const [presetUpdate, setPresetUpdate] = useState(false);
    const [gridApi, setGridApi] = useState(null);

    const [approvalLineVisible, setApprovalLineVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [addPresetVisible, setAddPresetVisible] = useState(false);
    const [loadPresetVisible, setLoadPresetVisible] = useState(false);
    const [requestVisible, setRequestVisible] = useState(false);

    const [loadPresetContent, setLoadPresetContent] = useState();
    const [flowViewer, setFlowViewer] = useState({name: '', flow: <></>, stringFlow: ''});
    const [useFlow, setUseFlow] = useState(undefined);

    const [roleList, setRoleList] = useState([]);
    const [roleServiceData, setRoleServiceData] = useState([]);

    const [orgUserTree, setOrgUserTree] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const [inputs, setInputs] = useState({
        rsn: '',
        presetName: '',
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
        const data = await GetData('/REST/authority/getRole', {}, 'a1');
        let dataArr = [];

        setGetDataSignal(true);
        if (data === undefined) {
            message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
            return false;
        } else if (data.length === 0 || data === '') {
            message.warning('요청 가능한 역할이 없습니다', 2);
            return false;
        } else {
            const data2 = await GetData('/REST/authority/getOnRequest', {}, '', 'auto');
            let requestedRoles = [];
            let requestedStatus = [];
            let requestedFrom = [];
            let requestedTo = [];

            if (data2.length !== 0) {
                for (let i = 0; i < data2.length; i++) {
                    requestedRoles.push(data2[i].ROLE_ID);
                    requestedStatus.push(parseInt(data2[i].STATUS));
                    requestedFrom.push(common.numberDateToString(data2[i].FROM_DATE));
                    requestedTo.push(common.numberDateToString(data2[i].TO_DATE));
                }
            }

            for (let i = 0; i < data.length; i++) {
                const obj = {
                    id: data[i].ID,
                    name: data[i].NAME,
                    usage: true
                };

                for (let j = 0; j < requestedRoles.length; j++) {
                    if (data[i].ID === requestedRoles[j]) {
                        switch (requestedStatus[j]) {
                            case 0:
                                obj.name += ' [결재진행]';
                                break;
                            case 1:
                            case 5:
                                obj.name += ' [적용중]';
                                break;
                            case 8:
                                obj.name += ' [기본권한]';
                                break;
                            case 9:
                                obj.name += ' [삭제예정]';
                                break;
                            default:
                        }
                        obj.usage = false;
                        obj.from = requestedFrom[j];
                        obj.to = requestedTo[j];
                        break;
                    } else {
                        obj.from = common.setDefaultDateFrom();
                        obj.to = common.setDefaultDateTo();
                    }
                }

                dataArr.push(obj);
            }
        }

        setRoleList(dataArr);
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

    function previewVisibleFunc(visible) {
        setPreviewVisible(visible);
    }

    function addPresetVisibleFunc(visible) {
        setAddPresetVisible(visible);
    }

    function loadPresetVisibleFunc(visible) {
        setLoadPresetVisible(visible);
    }

    function requestVisibleFunc(visible) {
        setRequestVisible(visible);
    }

    const addPreset = async () => {
        const data = await GetData("/REST/common/getOrgUserTreeData", {}, '', 'auto');

        if (data === undefined) {
            message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
            return false;
        } else {
            setOrgUserTree(<TreeDataViewerSelect data={makeOrgUserTree(data)} update={setSelectedIds}/>);
            addPresetVisibleFunc(true);
        }

        function makeOrgUserTree(array) {
            let returnData = [];
            let map = {};
            let isOpen = [];

            for (let i = 0; i < array.length; i++) {
                let obj = {key: array[i]['ID'], title: array[i]['NAME'], value: array[i]['ID']};

                if (array[i]['PARENT'] === '1') {
                    isOpen.push(obj.key);
                }

                if (array[i].SEPARATOR === '1') {
                    if (array[i].TARGET === '1') {
                        obj.title += '(본인)';
                        obj['icon'] = <SmileOutlined/>;
                        obj['disableCheckbox'] = true;
                    } else {
                        obj.title = (<>
                            {obj.title}{`(${obj.key})`}
                        </>);
                        obj['icon'] = <UserOutlined/>;
                    }
                } else {
                    obj['disableCheckbox'] = true;
                    obj.children = [];
                }

                map[obj.key] = obj;

                const parent = array[i]['PARENT_ID'] || '-1';

                if (!map[parent]) {
                    map[parent] = {
                        children: []
                    };
                }

                map[parent].children.push(obj);
            }

            returnData[0] = map['-1'].children;
            returnData[1] = isOpen;
            returnData[2] = [];
            return returnData;
        }
    };

    const savePreset = () => {
        if (inputs.presetName.length === 0) {
            message.warning('결재라인 프리셋 이름을 입력하세요', 2);
            return false;
        } else {
            let presetInfo = '';

            for (let i = 0; i < selectedIds.length; i++) {
                presetInfo += (i === 0 ? '' : ',') + selectedIds[i].value;
            }

            if (inputs.presetName.length === 0) {
                message.warning('결재자를 선택하세요', 2);
                return;
            }

            const obj = {
                presetName: inputs.presetName,
                preset: presetInfo
            };

            setPresetUpdate(true);
            SetData("/REST/approval/addPreset", obj, '', '', 'auto')
                .then((data) => {
                    if (data) {
                        message.success('저장되었습니다', 2);
                    } else {
                        message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                    }
                }).finally(() => setPresetUpdate(false));
        }
    };

    const loadPreset = async () => {
        const result = await GetData("/REST/approval/loadPreset", {}, '', 'auto');

        if (result === undefined) {
            message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
            return false;
        } else {
            const selectBox = (
                <select onChange={presetView}>
                    <option value="none">no select</option>
                    {result.map((data, index) => (
                        <option key={index} id={`${data.APPROVAL_LINE}|${data.APPROVAL_LINE_WITH_NAME}`}
                                value={data.NAME}>{data.NAME}</option>
                    ))}
                </select>
            );

            setFlowViewer({name: '', flow: <></>, stringFlow: ''});
            setLoadPresetContent(selectBox);
            setLoadPresetVisible(true);
        }

        function presetView(e) {
            const targetValue = e.target.value;

            if (targetValue !== 'none') {
                const presetData = e.target.options[e.target.selectedIndex].id.split('|');
                const stringFlow = presetData[1].replace(/,/gi, ' > ');
                const presetDataArr = presetData[0].split(',');

                setFlowViewer({
                    name: e.target.value,
                    flow: <ApprovalSteps data={presetDataArr}/>,
                    stringFlow: stringFlow
                });
            }
        }
    };

    const ApprovalSteps = (props) => {

        return (
            <Steps type="navigation">
                {props.data && props.data.map((item, index) => {
                    const status = index === 0 ? 'process' : 'wait';
                    const icon = <UserOutlined/>;
                    return <Step key={index} status={status} title={item}
                                 description={`${index + 1}차 결재`} icon={icon}/>
                })}
            </Steps>
        )
    };

    const deletePreset = () => {
        const obj = {
            presetName: flowViewer.name
        };

        SetData("/REST/approval/deletePreset", obj, '', '', 'auto')
            .then((data) => {
                if (data) {
                    message.success('삭제되었습니다', 2);
                    loadPreset();
                } else {
                    message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                }
            })
    };

    const request = () => {
        const data = gridApi.getSelectedRows();

        if (data.length === 0) {
            message.warning('선택된 역할이 없습니다', 2);
            return;
        }

        if (useFlow === undefined || useFlow.length === 0) {
            message.warning('선택된 결재라인이 없습니다', 2);
            return;
        }

        setRequestVisible(true);
    };

    const requestInit = () => {
        if (inputs.rsn.length === 0) {
            message.warning('사유를 입력하세요', 2);
            return false;
        } else {
            let flow = [];
            let also = flowViewer.stringFlow;

            while (also.indexOf('(') !== -1) {
                let obj = {
                    status: '0',
                    date: '',
                    rsn: ''
                };

                if (also.indexOf('(') !== -1) {
                    let tVal = also.substr(0, also.indexOf('('));
                    also = also.substr(also.indexOf('(') + 1, also.length);
                    obj['name'] = tVal;

                    tVal = also.substr(0, also.indexOf(')'));
                    also = also.substr(also.indexOf(')') + 4, also.length);
                    obj['id'] = tVal;

                    flow.push(obj);
                } else {
                    break;
                }
            }

            const data = gridApi.getSelectedRows();
            let roles = '';
            let roleByTerm = [];

            for (let i = 0; i < data.length; i++) {
                roles += (roles === '' ? '' : ',') + data[i].id;

                const obj = {
                    id: data[i].id,
                    name: data[i].name,
                    from: data[i].from,
                    to: data[i].to
                };

                roleByTerm.push(obj);
            }

            const approvalObj = {
                summary: roles,
                requestInfo: roleByTerm,
                rsn: inputs.rsn,
                targetId: flow[0].id,
                status: '0',
                flow: flow,
                type: 0
            };

            setRequestUpdate(true);
            SetData("/REST/approval/addApproval", approvalObj, 'a1', 5)
                .then((data) => {
                    if (data) {
                        message.success('결재요청 완료', 2);
                        setRequestVisible(false);
                        getData();
                    } else {
                        message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                    }
                }).finally(() => setRequestUpdate(false));
        }
    };

    const addPresetModalButtons = (
        <div key={'buttons'}>
            <Button onClick={() => {
                addPresetVisibleFunc(false)
            }}>닫기
            </Button>
            <Popconfirm
                title="저장하시겠습니까?"
                onConfirm={savePreset}
                okText="예"
                cancelText="아니오"
            >
                <Button type="primary" loading={presetUpdate}>저장</Button>
            </Popconfirm>
        </div>
    );

    const loadPresetModalButtons = (
        <div key={'buttons'}>
            <Button onClick={() => {
                loadPresetVisibleFunc(false)
            }}>닫기
            </Button>
            <Button type="primary" onClick={deletePreset}>삭제</Button>
            <Button type="primary" onClick={() => {
                setUseFlow(flowViewer.flow);
                setLoadPresetVisible(false);
                setApprovalLineVisible(true)
            }}>적용</Button>
        </div>
    );

    const requestModalButtons = (
        <div key={'buttons'}>
            <Button onClick={() => {
                requestVisibleFunc(false)
            }}>닫기
            </Button>
            <Popconfirm
                title="결재를 요청하시겠습니까?"
                onConfirm={requestInit}
                okText="예"
                cancelText="아니오"
            >
                <Button type="primary" loading={requestUpdate}>결재요청</Button>
            </Popconfirm>
        </div>
    );

    const getRoleInService = async (roleId) => {
        const data = await GetData("/REST/authority/getRoleInService", {roleId: roleId}, 'a11');

        if (data === undefined) {
            setPreviewVisible(false);
            message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
            return false;
        } else if (data.length === 0 || data === '') {
            setPreviewVisible(false);
            message.warning('매핑된 서비스가 없습니다', 2);
            return false;
        } else {
            setRoleServiceData(<TreeDataViewer data={makeTreeData(data)}/>);
            previewVisibleFunc(true);
        }

        function makeTreeData(array) {
            let returnData = [];
            let map = {};
            let isOpen = [];

            for (let i = 0; i < array.length; i++) {

                let obj = {key: array[i]['ID'], title: array[i]['NAME'], type: array[i]['TYPE']};

                if (obj.type === '1' || obj.type === 1) {
                    obj['icon'] = <FileTextOutlined/>;
                } else {
                    obj['children'] = [];
                    isOpen.push(obj.key);
                }

                map[obj.key] = obj;

                let parent = array[i]['PARENT_ID'] || 'null';

                if (!map[parent]) {
                    map[parent] = {
                        children: []
                    };
                }

                map[parent].children.push(obj);
                map[parent].children = map[parent].children.sort(function (a, b) {
                    return a.type - b.type;
                });
            }


            returnData[0] = map['null'].children;
            returnData[1] = isOpen;
            returnData[2] = [];
            return returnData;
        }
    };

    const PreviewService = (props) => {
        return (
            <CustomButton
                event={getRoleInService}
                data={props.data.id}
                icon={'cil-search'}
            />
        )
    };
    const SetDatePicker = (props) => {

        return (
            <DatePicker defaultValue={moment(props.value)} onChange={(d, s) => {
                s = s.replace(/-/g, '/')
                if (props.column.colId === 'from') {
                    props.data.from = s;
                } else if (props.column.colId === 'to') {
                    props.data.to = s;
                }
            }}/>
        )
    };
    const AddStatus = (props) => {
        const statusIdx = props.value.indexOf('[');
        let textDom;

        if (statusIdx !== -1) {
            const text = props.value.substr(0, statusIdx);
            const state = props.value.substr(statusIdx, props.value.length);

            textDom = <>
                {text}
                <div style={(state === '[삭제예정]'
                    ? {color: 'orange', display: 'inline'}
                    : {color: 'red', display: 'inline'})}>{state}</div>
            </>;
        } else {
            textDom = <>
                {props.value}
            </>;
        }

        return (
            textDom
        )
    };

    const frameworkComponents = {
        addStatus: AddStatus,
        datePicker: SetDatePicker,
        previewService: PreviewService,
    };
    const colOption = [
        {
            headerName: '',
            field: '',
            maxWidth: 50,
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
            checkboxSelection: true,
            rowSelection: 'multiple'
        },
        {headerName: "역할 명", field: "name", cellRenderer: 'addStatus'},
        {headerName: "적용 일시", field: "from", cellRenderer: 'datePicker'},
        {headerName: "만료 일시", field: "to", cellRenderer: 'datePicker'},
        {headerName: "메뉴", field: "id", cellRenderer: 'previewService', maxWidth: 80,}
    ];

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>권한 신청</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol className="function-btns" sm={12}>
                                    <Button type="primary" onClick={request}>결재요청</Button>
                                    <Button type="primary" onClick={loadPreset}>결재라인 불러오기</Button>
                                    <Button type="primary" onClick={addPreset}>결재라인 생성</Button>
                                </CCol>
                            </CRow>

                            <CRow className="g-3">
                                <CCollapse show={approvalLineVisible} style={{width:'100%'}}>
                                    <CCard className="mt-3">
                                        <CCardBody>
                                            <div className='approval-detail-content limit-max-width'>
                                                {useFlow}
                                            </div>
                                        </CCardBody>
                                    </CCard>
                                </CCollapse>
                            </CRow>

                            <CRow className="g-3">
                                <SetAgGrid data={[...roleList]}
                                           frameworkComponents={frameworkComponents}
                                           colOption={colOption}
                                           onGridReady={onGridReady}
                                           isRowSelectable={function (rowNode) {
                                               return rowNode.data.usage ? true : false;
                                           }}
                                />
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Modal
                visible={previewVisible}
                visibleFunc={previewVisibleFunc}
                title='역할/메뉴 구조'
                content={roleServiceData}
            />

            <Modal
                visible={addPresetVisible}
                visibleFunc={addPresetVisibleFunc}
                title='결재라인 생성'
                content={
                    <div className="row">
                        <div style={{textAlign: 'center', width: '100%'}}>
                            결재라인 선택
                            {orgUserTree}
                        </div>
                        <div className='preset-name-div' style={{width: '100%'}}>
                            <div style={{padding: '20px 0'}}>
                                <Form
                                    layout='horizontal'
                                    initialValues={{
                                        layout: 'horizontal',
                                    }}
                                >
                                    <Input name='presetName' placeholder="저장할 결재라인 프리셋명" onChange={onChange}/>
                                </Form>
                            </div>
                        </div>
                    </div>
                }
                buttons={addPresetModalButtons}
            />

            <Modal
                visible={loadPresetVisible}
                visibleFunc={loadPresetVisibleFunc}
                title='결재라인 선택 (좌측 -> 우측 순)'
                buttons={loadPresetModalButtons}
                content={
                    <>
                        {loadPresetContent}
                        <div style={{padding: '10px 2px'}}>
                            {flowViewer.flow}
                        </div>
                    </>
                }
            />

            <Modal
                visible={requestVisible}
                visibleFunc={requestVisibleFunc}
                title='결재요청 사유를 입력하세요'
                buttons={requestModalButtons}
                content={
                    <textarea
                        rows='5'
                        style={{width: '100%'}}
                        name='rsn'
                        onChange={onChange}
                    />
                }
            />
        </>
    )
};

export default Request;