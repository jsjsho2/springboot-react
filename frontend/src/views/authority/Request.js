import React, {useCallback, useEffect, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CCollapse, CRow,} from '@coreui/react'
import * as common from '../../components/CommonFunction';
import SetAgGrid from "../../components/SetAgGrid";
import CustomButton from "../../components/CustomButton";
import TreeDataViewer from "../../components/TreeDataViewer";
import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import SetData from "../../ajax/SetData";
import {FileTextOutlined, PlusOutlined, SmileOutlined, UserOutlined,} from '@ant-design/icons';
import {Button, DatePicker, Form, Input, message, Popconfirm, Steps, Tag, Upload} from 'antd';
import 'antd/dist/antd.css';
import moment from 'moment';

const {Step} = Steps;

const addPresetMessageSample = '관리자가 설정한 직위별 ${n}차 결재라인 적용만 허용됩니다';

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
    const [flowViewer, setFlowViewer] = useState({name: '', flow: <></>, flowOfIds: [], flowOfNames: []});
    const [useFlow, setUseFlow] = useState(undefined);

    const [roleList, setRoleList] = useState([]);
    const [roleServiceData, setRoleServiceData] = useState([]);

    const [orgUserTree, setOrgUserTree] = useState([]);
    const [addPresetMessage, setAddPresetMessage] = useState('');
    const [addPresetDiv, setAddPresetDiv] = useState(undefined);

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
            preview: visible => {
                setPreviewVisible(visible);
            },
            addPreset: visible => {
                setAddPresetVisible(visible);
            },
            loadPreset: visible => {
                setLoadPresetVisible(visible);
            },
            request: visible => {
                setRequestVisible(visible);
            }
        },
        getData: async () => {
            setGetDataSignal(false);
            const data = await GetData('/REST/authority/getRole', {}, 'a1');
            let dataArr = [];

            setGetDataSignal(true);
            if (data === undefined) {
                message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                return false;
            } else if (data.length === 0 || data === '') {
                message.warning('요청 가능한 역할이 없습니다', 2);
                common.showGridNoRowMsg();
            } else {
                common.hideGridNoRowMsg();

                for (let i = 0; i < data.length; i++) {
                    const obj = {
                        id: data[i].ID,
                        name: data[i].NAME,
                        from: common.setDefaultDateFrom(),
                        to: common.setDefaultDateTo(),
                        status: data[i].STATUS
                    };

                    dataArr.push(obj);
                }
            }

            setRoleList(dataArr);
        },
        request: {
            confirm: () => {
                const data = gridApi.getSelectedRows();

                if (data.length === 0) {
                    message.warning('선택된 역할이 없습니다', 2);
                    return;
                }

                if (flowViewer.name === "") {
                    message.warning('선택된 결재라인이 없습니다', 2);
                    return;
                }

                setRequestVisible(true);
            },
            init: () => {
                if (inputs.rsn.length === 0) {
                    message.warning('사유를 입력하세요', 2);
                    return false;
                } else {
                    let flow = [];

                    for (let i = 0; i < flowViewer.flowOfIds.length; i++) {
                        const obj = {
                            status: '0',
                            date: '',
                            rsn: '',
                            id: flowViewer.flowOfIds[i],
                            name: flowViewer.flowOfNames[i],
                        };

                        flow.push(obj);
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
                                fn.getData();
                            } else {
                                message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                            }
                        }).finally(() => setRequestUpdate(false));
                }
            },
        },
        SetDatePicker: props => {

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
        },
        PreviewService: props => {
            const getRoleInService = async roleId => {
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
                    fn.visible.preview(true);
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

            return (
                <CustomButton
                    event={getRoleInService}
                    data={props.data.id}
                    icon={'cil-search'}
                />
            )
        },
        preset: {
            add: async () => {
                const data = await GetData("/REST/common/getOrgUserTreeDataOnMapping", {}, '', 'auto');

                if (data === undefined) {
                    message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                    return false;
                } else {
                    setOrgUserTree(<TreeDataViewer data={makeOrgUserTree(data)} checkable={false}/>)
                    fn.visible.addPreset(true);
                }

                function makeOrgUserTree(array) {
                    let returnData = [];
                    let map = {};
                    let isOpen = [];

                    for (let i = 0; i < array.length; i++) {
                        let obj = {
                            key: array[i].SEPARATOR === '1' ? common.createUuid() : array[i]['ID'],
                            title: array[i]['NAME'],
                            value: array[i]['ID']
                        };

                        if ((i + 1 !== array.length && array[i + 1].SEPARATOR !== '1' && array[i].PARENT === '1') ||
                            (i + 1 !== array.length && array[i].PARENT === '1' && array[i].SEPARATOR === '0')) {
                            isOpen.push(obj.key);
                        }

                        if (array[i].SEPARATOR === '1') {
                            obj.title += array[i].POSITION !== null ? ` ${array[i]['POSITION']}` : '';

                            if (array[i].TARGET === '1') {
                                if (array[i].N_STEP === null) {
                                    setAddPresetMessage('관리자가 설정한 직위별 결재라인이 없습니다. 관리자에게 문의바랍니다');
                                    setTimeout(() => {
                                        const addPresetBtn = document.getElementById('addPresetBtn');
                                        addPresetBtn.setAttribute('style', 'display: none')
                                        document.getElementById('presetName').disabled = true;
                                    }, 700);
                                } else {
                                    obj['icon'] = <SmileOutlined/>;

                                    const nStep = parseInt(array[i].N_STEP);
                                    let divs = [];
                                    let msg = addPresetMessageSample.replace('${n}', array[i].N_STEP);

                                    for (let j = 1; j <= nStep; j++) {
                                        divs.push(
                                            <div className={'approval-line-manager-wrapper'} key={common.createUuid()}>
                                                {j}차 결재자
                                                <div className={'approval-line-manager-div'} id={`approvalManager${j}`}
                                                     data={''}>
                                                    -
                                                </div>
                                            </div>
                                        )
                                    }
                                    setAddPresetDiv(divs);

                                    if (array[i].SELF === '1') {
                                        msg += ' (본인결재 허용)';

                                        let addLineButton = [];
                                        for (let j = 1; j <= parseInt(array[i].N_STEP); j++) {
                                            addLineButton.push(
                                                <button className='treeview-add-line' key={common.createUuid()}
                                                        onClick={e => {
                                                            const targetStep = document.getElementById(`approvalManager${j}`);
                                                            targetStep.innerText = `${array[i].NAME} ${array[i]['POSITION']}`;
                                                            targetStep.setAttribute('data', array[i].ID);
                                                            e.stopPropagation();
                                                        }}>
                                                    {j}차
                                                </button>
                                            );
                                        }

                                        obj.title =
                                            <>
                                                {obj.title}
                                                {addLineButton}
                                            </>
                                    } else {
                                        msg += ' (본인결재 불가)';
                                    }

                                    setAddPresetMessage(msg);
                                }
                            } else {
                                obj['icon'] = <UserOutlined/>;
                            }

                            if (array[i].STEP !== null) {
                                obj.title = <>
                                    {obj.title}
                                    <button className='treeview-add-line' onClick={e => {
                                        const targetStep = document.getElementById(`approvalManager${array[i].STEP}`);
                                        targetStep.innerText = `${array[i].NAME} ${array[i]['POSITION']}`;
                                        targetStep.setAttribute('data', array[i].ID);
                                        e.stopPropagation();
                                    }}>
                                        {array[i].STEP}차
                                    </button>
                                </>
                            }
                        } else {
                            obj['children'] = [];
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
            },
            save: () => {
                if (inputs.presetName.length === 0) {
                    message.warning('결재라인 프리셋 이름을 입력하세요', 2);
                    return false;
                } else {
                    const managerCheck = document.getElementsByClassName('approval-line-manager-div');
                    let presetInfo = '';

                    for (let i = 0; i < managerCheck.length; i++) {
                        if (managerCheck[i].innerText === '-') {
                            message.warning(`${i + 1}차 결재자를 선택하세요`, 2);
                            return false;
                        } else {
                            presetInfo += (i === 0 ? '' : ',') + managerCheck[i].getAttribute('data');
                        }
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
            },
            load: async () => {
                const result = await GetData("/REST/approval/loadPreset", {}, '', 'auto');

                if (result === undefined) {
                    message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                    return false;
                } else {
                    const selectBox = (
                        <select onChange={presetView}>
                            <option value="none">no select</option>
                            {result.map((data, index) => (
                                <option key={index} id={`${data.APPROVAL_LINE}|${data.APPROVAL_LINE_ID}`}
                                        value={data.NAME}>{data.NAME}</option>
                            ))}
                        </select>
                    );

                    setFlowViewer({name: '', flow: <></>, flowOfIds: [], flowOfNames: []});
                    setLoadPresetContent(selectBox);
                    setLoadPresetVisible(true);
                }

                function presetView(e) {
                    const targetValue = e.target.value;

                    if (targetValue !== 'none') {
                        const presetData = e.target.options[e.target.selectedIndex].id.split('|');
                        const flowOfIds = presetData[1].split(',');
                        const presetDataArr = presetData[0].split(',');

                        setFlowViewer({
                            name: e.target.value,
                            flow: <ApprovalSteps data={presetDataArr}/>,
                            flowOfIds: flowOfIds,
                            flowOfNames: presetDataArr
                        });
                    } else {
                        setFlowViewer({
                            name: '',
                            flow: <></>,
                            flowOfIds: [],
                            flowOfNames: []
                        });
                    }
                }

                const ApprovalSteps = props => {

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
            },
            delete: () => {
                const obj = {
                    presetName: flowViewer.name
                };

                SetData("/REST/approval/deletePreset", obj, '', '', 'auto')
                    .then((data) => {
                        if (data) {
                            message.success('삭제되었습니다', 2);
                            fn.preset.load();
                        } else {
                            message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                        }
                    })
            }
        }
    }

    const grid = {
        CustomStatus: props => {
            let statusText = '';
            switch (parseInt(props.value)) {
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
                default :
                    statusText = <Tag color="gray">결재이력 없음</Tag>;
                    break;
            }

            return (statusText);
        },
        colOption: [
            {
                headerName: '',
                field: '',
                maxWidth: 50,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                rowSelection: 'multiple'
            },
            {headerName: "역할 명", field: "name"},
            {headerName: "마지막 상태", field: "status", cellRenderer: 'customStatus'},
            {headerName: "적용 일시", field: "from", cellRenderer: 'datePicker'},
            {headerName: "만료 일시", field: "to", cellRenderer: 'datePicker'},
            {headerName: "메뉴", field: "id", cellRenderer: 'previewService', maxWidth: 80,}
        ],
        onGridReady: params => {
            setGridApi(params.api);
        },
    };

    const frameworkComponents = {
        customStatus: grid.CustomStatus,
        datePicker: fn.SetDatePicker,
        previewService: fn.PreviewService,
    }

    const modalButtons = {
        addPreset: (
            <div key={'buttons'} id='addPresetBtn'>
                <Button onClick={() => {
                    fn.visible.addPreset(false)
                }}>닫기
                </Button>
                <Popconfirm
                    title="저장하시겠습니까?"
                    onConfirm={fn.preset.save}
                    okText="예"
                    cancelText="아니오"
                >
                    <Button type="primary" loading={presetUpdate}>저장</Button>
                </Popconfirm>
            </div>
        ),
        loadPreset: (
            <div key={'buttons'}>
                <Button onClick={() => {
                    fn.visible.loadPreset(false)
                }}>닫기
                </Button>
                <Button type="primary" onClick={fn.preset.delete}>삭제</Button>
                <Button type="primary" onClick={() => {
                    if (flowViewer.name !== '') {
                        setUseFlow(flowViewer.flow);
                        setApprovalLineVisible(true);
                    } else {
                        setUseFlow(undefined);
                        setApprovalLineVisible(false);
                    }
                    setLoadPresetVisible(false);
                }}>적용</Button>
            </div>
        ),
        request: (
            <div key={'buttons'}>
                <Button onClick={() => {
                    fn.visible.request(false)
                }}>닫기
                </Button>
                <Popconfirm
                    title="결재를 요청하시겠습니까?"
                    onConfirm={fn.request.init}
                    okText="예"
                    cancelText="아니오"
                >
                    <Button type="primary" loading={requestUpdate}>결재요청</Button>
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
                            <strong>권한 신청</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol className="function-btns" sm={12}>
                                    <Button type="primary" onClick={fn.request.confirm}>결재요청</Button>
                                    <Button type="primary" onClick={fn.preset.load}>결재라인 불러오기</Button>
                                    <Button type="primary" onClick={fn.preset.add}>결재라인 생성</Button>
                                </CCol>
                            </CRow>

                            <CRow className="g-3">
                                <CCollapse show={approvalLineVisible} style={{width: '100%'}}>
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
                                           colOption={grid.colOption}
                                           onGridReady={grid.onGridReady}
                                           isRowSelectable={function () {
                                               return true;
                                           }}
                                />
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Modal
                visible={previewVisible}
                visibleFunc={fn.visible.preview}
                title='역할/메뉴 구조'
                content={roleServiceData}
            />

            <Modal
                visible={addPresetVisible}
                visibleFunc={fn.visible.addPreset}
                title='결재라인 생성'
                content={
                    <div className="row">
                        <div style={{color: 'red', fontSize: '13px', textAlign: 'center', width: '100%'}}>
                            {addPresetMessage}
                        </div>
                        <div style={{width: '60%'}}>
                            {orgUserTree}
                        </div>
                        <div style={{width: '40%'}}>
                            <div className='preset-name-div' style={{width: '100%'}}>
                                <div style={{padding: '0px 0 8px 7px', textAlign: 'center'}}>
                                    <Form
                                        layout='horizontal'
                                        initialValues={{
                                            layout: 'horizontal',
                                        }}
                                    >
                                        <Input name='presetName' id='presetName' placeholder="저장할 결재라인 프리셋명"
                                               onChange={onChange}/>
                                    </Form>
                                </div>
                            </div>

                            {addPresetDiv}
                        </div>
                    </div>
                }
                buttons={modalButtons.addPreset}
                type='modal-middle-size'
            />

            <Modal
                visible={loadPresetVisible}
                visibleFunc={fn.visible.loadPreset}
                title='결재라인 선택'
                buttons={modalButtons.loadPreset}
                content={
                    <>
                        <div style={{
                            color: 'red',
                            fontSize: '13px',
                            textAlign: 'center',
                            width: '100%',
                            marginBottom: '15px'
                        }}>
                            관리자가 설정한 직위/결재 설정값에 부합한 결재선만 보여집니다
                        </div>
                        {loadPresetContent}
                        <div style={{padding: '10px 2px'}}>
                            {flowViewer.flow}
                        </div>
                    </>
                }
            />

            <Modal
                visible={requestVisible}
                visibleFunc={fn.visible.request}
                title='결재요청 사유를 입력하세요'
                buttons={modalButtons.request}
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