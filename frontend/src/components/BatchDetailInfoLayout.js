import {CCol, CCollapse, CInput, CLabel, CTextarea, CRow} from "@coreui/react";
import React, {useEffect, useState} from "react";
import {DatePicker, Radio, Switch, TimePicker} from "antd";
import moment from "moment";

const BatchDetailInfoLayout = (props) => {

    const [exeTypeVisible, setExeTypeVisible] = useState([false, false]);
    const [batchTypeVisible, setBatchTypeVisible] = useState([false, false]);

    const [inputs, setInputs] = useState({
        uuid: props.data.uuid,
        name: props.data.name,
        batchType: props.data.batchType,
        sql: props.data.sql,
        fileName: props.data.fileName,
        exeType: props.data.exeType,
        every: props.data.every,
        specific: props.data.specific,
        usage: props.data.usage,
        beforeUsage: props.data.usage
    });
    const onChange = (e) => {
        const {name, value} = e.target;
        const nextInputs = {
            ...inputs,
            [name]: value,
        };

        setInputs(nextInputs)
    };
    const onDatetime = (datetime) => {
        if (inputs.exeType === 'every') {
            onChange({target: {name: 'every', value: datetime || ''}})
        } else {
            onChange({target: {name: 'specific', value: datetime || ''}})
        }
    };
    const collapseChange = (type = {name: 'all', value: false}) => {
        if (type.name === 'all') {
            setBatchTypeVisible(inputs.batchType === 'sql' ? [true, false] : [false, true]);
            setExeTypeVisible(inputs.exeType === 'every' ? [true, false] : [false, true]);
        } else if (type.name === 'batchType') {
            let delay = [];
            if (type.value === 'sql') {
                setBatchTypeVisible([false, false]);
                delay = [true, false]
            } else {
                setBatchTypeVisible([false, false]);
                delay = [false, true]
            }

            setTimeout(() => {
                setBatchTypeVisible(delay);
            }, 450)

        } else if (type.name === 'exeType') {
            let delay = [];
            if (type.value === 'every') {
                setExeTypeVisible([false, false]);
                delay = [true, false]
            } else {
                setExeTypeVisible([false, false]);
                delay = [false, true]
            }

            setTimeout(() => {
                setExeTypeVisible(delay);
            }, 450)
        }
    };

    useEffect(() => {
        collapseChange();
    }, []);
    useEffect(() => {
        props.onChange(inputs);
    }, [inputs]);

    const dateFormat = 'MM-DD HH:mm:ss';

    return (
        <>
            <CRow className="mb-3">
                <CLabel className="col-sm-2 col-form-label">배치명</CLabel>
                <CCol sm={10}>
                    <CInput type="text" name='name' value={inputs.name} onChange={(e) => {
                        onChange(e);
                    }}/>
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CLabel className="col-sm-2 col-form-label">배치타입</CLabel>
                <CCol sm={10}>
                    <Radio.Group
                        options={[
                            {label: 'SQL', value: 'sql'},
                            {label: '파일', value: 'file'},
                        ]}
                        onChange={(e) => {
                            onChange({target: {name: 'batchType', value: e.target.value}});
                            collapseChange({name: 'batchType', value: e.target.value});
                        }}
                        value={inputs.batchType}
                        optionType="button"
                    />
                </CCol>
            </CRow>

            <CCollapse show={batchTypeVisible[0]} className={'row mb-3'}>
                <CLabel className="col-sm-2 col-form-label">배치 SQL</CLabel>
                <CCol sm={10}>
                    <CTextarea rows="6" name='sql' value={inputs.sql} onChange={(e) => {
                        onChange(e);
                    }}></CTextarea>
                </CCol>
            </CCollapse>
            <CCollapse show={batchTypeVisible[1]} className={'row mb-3'}>
                <CLabel className="col-sm-2 col-form-label">파일명</CLabel>
                <CCol sm={10}>
                    <CInput type="text" name='fileName' value={inputs.fileName} onChange={(e) => {
                        onChange(e);
                    }}/>
                </CCol>
            </CCollapse>

            <CRow className="mb-3">
                <CLabel className="col-sm-2 col-form-label">동작방식</CLabel>
                <CCol sm={10}>
                    <Radio.Group
                        options={[
                            {label: '매일', value: 'every'},
                            {label: '특정일시', value: 'specific'},
                        ]}
                        onChange={(e) => {
                            onChange({target: {name: 'exeType', value: e.target.value}});
                            collapseChange({name: 'exeType', value: e.target.value});
                        }}
                        value={inputs.exeType}
                        optionType="button"
                    />
                </CCol>
            </CRow>

            <CCollapse show={exeTypeVisible[0]} className={'row mb-3'}>
                <CLabel className="col-sm-2 col-form-label">동작시간</CLabel>
                <CCol sm={10}>
                    <TimePicker name={'every'}
                                defaultValue={inputs.every !== '' ? (moment(inputs.every, 'HH:mm:ss')) : ''}
                                onChange={onDatetime}/>
                </CCol>
            </CCollapse>

            <CCollapse show={exeTypeVisible[1]} className={'row mb-3'}>
                <CLabel className="col-sm-2 col-form-label">동작시간<br/>(년도지정 불가)</CLabel>
                <CCol sm={10}>
                    <DatePicker name={'specific'} showTime format={dateFormat}
                                defaultValue={inputs.specific !== '' ? (moment(inputs.specific)) : ('')}
                                onChange={onDatetime}/>
                </CCol>
            </CCollapse>

            <CRow className="mb-3">
                <CLabel className="col-sm-2 col-form-label">사용여부</CLabel>
                <CCol sm={10}>
                    <Switch defaultChecked={parseInt(props.data.usage) === 0 ? true : false} onChange={(e) => {
                        onChange({target: {name: 'usage', value: e ? 0 : 1}});
                    }}/>
                </CCol>
            </CRow>
        </>
    )
};

export default BatchDetailInfoLayout;