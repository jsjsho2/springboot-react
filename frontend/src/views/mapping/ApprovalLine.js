import React, {useEffect, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CRow,} from '@coreui/react'
import Modal from "../../components/Modal";
import GetData from "../../ajax/GetData";
import SetData from "../../ajax/SetData";
import * as common from '../../components/CommonFunction';
import {Button, message, Popconfirm, Checkbox, Row, Col, Select} from "antd";

const {Option} = Select;

const RoleService = () => {
    const [positionList, setPositionList] = useState([]);
    const [loadPositionList, setLoadPositionList] = useState(undefined);
    const [nApprovalEl, setNApprovalEl] = useState(undefined);
    const [loadVisible, setLoadVisible] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [inputs, setInputs] = useState({
        nApproval: 0,
        self: 0,
        targets: [],
        step1: [],
        step2: [],
        step3: [],
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
        GetData("/REST/mapping/getPositionList", {}, '', 'auto')
            .then(d => {
                setPositionList(d);

                let loadBtns = [];

                for (let i = 0; i < d.length; i++) {
                    loadBtns.push(
                        <div style={{marginTop: '5px'}} key={common.createUuid()}>
                            <button className="btn btn-secondary" type="button" onClick={e => {
                                GetData("/REST/mapping/getPositionByApprovalConfig", {target: d[i].value}, '', 'auto')
                                    .then(d2 => {
                                        if (d2.length === 0 || d2.constructor === Object && Object.keys(d2).length === 0) {
                                            message.info(`저장된 값이 없습니다`, 2);
                                            return false;
                                        } else {
                                            const obj = {
                                                nApproval: parseInt(d2.N_STEP),
                                                self: parseInt(d2.SELF),
                                                targets: d2.TARGET.split(','),
                                                step1: d2.STEP1.split(','),
                                                step2: d2.STEP2.split(','),
                                                step3: d2.STEP3.split(','),
                                            }

                                            fn.visible.load(false);
                                            fn.setNApproval(obj, d);
                                        }
                                    })
                            }}>{d[i].label}
                            </button>
                        </div>
                    )
                }

                setLoadPositionList(
                    <div style={{textAlign: 'center'}}>
                        {loadBtns}
                    </div>)
            });
    }, []);

    const fn = {
        visible: {
            load: visible => {
                setLoadVisible(visible);
            }
        },
        updateApprovalLine: () => {
            setUpdating(true);

            let obj = {
                nStep: inputs.nApproval,
                self: inputs.self,
                target: [],
                step1: [],
                step2: [],
                step3: [],
            };

            const targets = document.getElementsByClassName(`targets_checkbox`);

            for (let i = 0; i < targets.length; i++) {
                if (targets[i].checked) {
                    obj.target.push(targets[i].value)
                }
            }

            for (let i = 1; i <= inputs.nApproval; i++) {
                const steps = document.getElementsByClassName(`step${i}_checkbox`);

                for (let l = 0; l < steps.length; l++) {
                    if (steps[l].checked) {
                        obj[`step${i}`].push(steps[l].value)
                    }
                }
            }

            if (obj.target.length === 0) {
                message.warning('매핑 대상이 선택되지 않았습니다', 2);
                setUpdating(false);
                return false;
            }

            let check = true;

            if (obj.nStep === 0 && obj.self === 0) {
                message.warning('0차 결재인 경우 본인 결재 허용이 체크되어야합니다', 2);
                check = false;
            }


            for (let i = 1; i <= obj.nStep; i++) {
                if (obj[`step${i}`].length === 0) {
                    message.warning(`${i}차 결재선 직위가 선택되지 않았습니다`, 2);
                    check = false;
                }
            }

            if (!check) {
                setUpdating(false);
                return false;
            }

            SetData("/REST/mapping/updateApprovalStep", obj, 'c3', 2)
                .then((data) => {
                    if (data) {
                        message.success('저장되었습니다', 2);
                        // getData();
                    } else {
                        message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
                    }
                }).finally(() => {
                setUpdating(false);
            });
        },
        setNApproval: (condition, data) => {

            setInputs(condition)

            let el = [];

            for (let i = 1; i <= condition.nApproval; i++) {
                el.push(
                    <CCol sm={3} className={'approval-mapping-row'} key={common.createUuid()}>
                        <fn.MakePositionList step={`step${i}`} txt={`${i}차 결재선 직위`} condition={condition} data={data}/>
                    </CCol>
                )
            }

            setNApprovalEl(el);
        },
        MakePositionList: t => {

            return (
                <>
                    <div style={{textAlign: 'center', fontSize: '20px'}}>{t.txt}</div>
                    {t.data.map(d => {
                        const key = `${t.step}_${d.value}`;

                        return (
                            <div className="form-check" key={key}>
                                <input className={`form-check-input ${t.step}_checkbox`} type="checkbox"
                                       value={d.value}
                                       id={key}
                                       defaultChecked={t.condition[t.step].indexOf(d.value) != -1 ? true : false}
                                       onChange={e => {
                                           if (e.target.classList.contains('targets_checkbox')) {

                                               let targetArr = inputs.targets;

                                               if (e.target.checked) {
                                                   targetArr.push(e.target.value);
                                               } else {
                                                   for (let i = 0; i < targetArr.length; i++) {
                                                       if (targetArr[i] === e.target.value) {
                                                           targetArr.splice(i, 1);
                                                           i--;
                                                       }
                                                   }
                                               }

                                               setInputs({
                                                   ...inputs,
                                                   ['targets']: targetArr,
                                               });
                                           }
                                       }}
                                />
                                <label className="form-check-label" htmlFor={key}>
                                    {d.label}
                                </label>
                            </div>
                        )
                    })}
                </>
            );
        }
    };

    return (
        <>
            <CRow>
                <CCol xs={12}>
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>직위&결재선 매핑</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="g-3">
                                <CCol className="function-btns" sm={12}>
                                    <Popconfirm
                                        title="저장하시겠습니까?"
                                        onConfirm={fn.updateApprovalLine}
                                        okText="예"
                                        cancelText="아니오"
                                    >
                                        <Button type="primary" loading={updating}>저장</Button>
                                    </Popconfirm>
                                    <Button type="primary" onClick={e => {
                                        fn.visible.load(true)
                                    }}>불러오기</Button>
                                </CCol>

                                <CCol className="" sm={12}>
                                    <div className={'approval-mapping-function1'}>
                                        <Select defaultValue={0} style={{width: 50}}
                                                onChange={v => {
                                                    onChange({target: {name: 'nApproval', value: v}})
                                                    fn.setNApproval({
                                                        ...inputs,
                                                        ['nApproval']: v,
                                                    }, positionList)
                                                }}>
                                            <Option value={0}>0</Option>
                                            <Option value={1}>1</Option>
                                            <Option value={2}>2</Option>
                                            <Option value={3}>3</Option>
                                        </Select>
                                        &nbsp;차 결재&nbsp;
                                    </div>
                                </CCol>

                                <CCol className="" sm={12}>
                                    <div className={'approval-mapping-function2'}>
                                        <Checkbox checked={inputs.self === 1 ? true : false} onChange={e => {
                                            onChange({target: {name: 'self', value: e.target.checked ? 1 : 0}})
                                        }}>본인 결재 허용</Checkbox>
                                    </div>
                                </CCol>
                            </CRow>

                            <CRow>
                                <CCol sm={3} className={'approval-mapping-row'}>
                                    <fn.MakePositionList step={'targets'} txt={'매핑 대상 직위'} condition={inputs}
                                                      data={positionList}/>
                                </CCol>

                                {nApprovalEl}
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <Modal
                visible={loadVisible}
                visibleFunc={fn.visible.load}
                title='저장된 매핑값 불러오기'
                buttons={
                    <Button onClick={() => {
                        fn.visible.load(false)
                    }}>
                        닫기
                    </Button>}
                content={loadPositionList}
            />
        </>
    )
};

export default RoleService;
