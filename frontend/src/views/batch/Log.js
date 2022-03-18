import React, {useEffect, useState} from 'react'
import {CCard, CCardBody, CCardHeader, CCol, CRow,} from '@coreui/react'
import {Badge, Calendar, message, Tag} from "antd";
import Modal from "../../components/Modal";
import * as common from '../../components/CommonFunction';
import GetData from "../../ajax/GetData";

let getDataMessage;

const Log = () => {
  const [batchLogList, setBatchLogList] = useState([]);
  const [calender, setCalender] = useState(undefined);
  const [getDataSignal, setGetDataSignal] = useState(false);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailContent, setDetailContent] = useState(undefined);

  async function getData(dateRange) {
    setGetDataSignal(false);

    const data = await GetData('/REST/batch/batchLog', dateRange, 'd1');

    setGetDataSignal(true);
    let returnData = [];

    if (data === undefined) {
      message.error('[ERROR] 오류가 계속 발생하면 관리자에게 문의바랍니다', 2);
      return false;
    } else {
      for (let i = 0; i < data.length; i++) {
        const obj = {
          uuid: data[i].UUID,
          name: data[i].BATCH_NAME,
          start: common.numberDateToString(data[i].START_DATE),
          end: common.numberDateToString(data[i].END_DATE),
          status: parseInt(data[i].STATUS)
        };

        returnData.push(obj)
      }
    }

    setBatchLogList(returnData);
  }

  async function getDetailData(uuid) {
    const data = await GetData('/REST/batch/batchLogOne', {uuid: uuid}, 'd11');
    const results = [<Tag key={'tag1'} color="blue">성공</Tag>, <Tag key={'tag2'} color="red">실패</Tag>];

    setDetailContent(
      <>
        <span style={{color: '#767676'}}>배치명:</span> {data[0].BATCH_NAME}<br/>
        <span style={{color: '#767676'}}>배치 시작일시</span> {common.numberDateToString(data[0].START_DATE)}<br/>
        <span style={{color: '#767676'}}>배치 종료일시:</span> {common.numberDateToString(data[0].END_DATE)}<br/>
        <span style={{color: '#767676'}}>결과:</span> {results[parseInt(data[0].STATUS)]}<br/>
        <span style={{color: '#767676'}}>결과 메세지:</span> {data[0].DETAIL_LOG}<br/>
      </>
    );
    setDetailVisible(true);
  }

  useEffect(() => {
    if (!getDataSignal) {
      getDataMessage = message.loading('Now Loading...', 0);
    } else {
      setTimeout(getDataMessage, 200);
    }
  }, [getDataSignal]);
  useEffect(() => {
    setCalender(<Calendar dateCellRender={dateCellRender} onPanelChange={(date) => {
      getData(dateRangeSetting(new Date(date)));
    }}/>);
  }, [batchLogList]);
  useEffect(() => {
    getData(dateRangeSetting(new Date()));
  }, []);

  const detailVisibleFunc = (visible) => {
    setDetailVisible(visible);
  };

  function dateCompare(batchLogList, value) {
    let list = [];

    for (let i = 0; i < batchLogList.length; i++) {
      const dateTime = new Date(batchLogList[i].start);
      const Odate = dateTime.getDate();
      const Omonth = dateTime.getMonth();
      const Oyear = dateTime.getFullYear();
      const Tdate = value.date();
      const Tmonth = value.month();
      const Tyear = value.year();
      let obj = {type: '', content: batchLogList[i].name, uuid: batchLogList[i].uuid};

      if (Odate === Tdate && Omonth === Tmonth && Oyear === Tyear) {
        if (batchLogList[i].status === 0) {
          obj.type = 'success';
        } else if (batchLogList[i].status === 1) {
          obj.type = 'error';
        } else {
          obj.type = 'warning';
        }

        list.push(obj)
      }
    }


    return list;
  }

  const dateRangeSetting = (dateConditon) => {
    const y = dateConditon.getFullYear();
    const m = dateConditon.getMonth();
    const firstDay = new Date(y, m, 1);
    const firstDayCount = new Date(y, m, 1).getDay();
    const lastDay = new Date(y, m + 1, 0);
    const lastDayCount = new Date(y, m + 1, 0).getDay();

    firstDay.setDate(firstDay.getDate() - firstDayCount);
    lastDay.setDate(lastDay.getDate() + (6 - lastDayCount));

    const startDate = ("0" + firstDay.getDate()).slice(-2);
    const startMonth = ("0" + (firstDay.getMonth() + 1)).slice(-2);
    const startYear = firstDay.getFullYear();

    const lastDate = ("0" + lastDay.getDate()).slice(-2);
    const lastMonth = ("0" + (lastDay.getMonth() + 1)).slice(-2);
    const lastYear = lastDay.getFullYear();

    return {
      from: `${startYear}/${startMonth}/${startDate} 00:00:00`,
      to: `${lastYear}/${lastMonth}/${lastDate} 23:59:59`
    };
  };

  const getListData = value => {
    let listData = [];

    if (batchLogList.length !== 0) {
      listData = dateCompare(batchLogList, value)
    }

    return listData || [];
  };

  function dateCellRender(value) {
    const listData = getListData(value);

    return (
      <ul className="events">
        {listData.map(item => (
          <li key={common.createUuid()}>
            <Badge status={item.type} text={item.content} uuid={item.uuid} style={{width: 'unset'}} onClick={e => {
              const uuid = e.target.classList.contains('ant-badge-not-a-wrapper') ? e.target.getAttribute('uuid') : e.target.parentNode.getAttribute('uuid');
              getDetailData(uuid);
            }}/>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>배치 로그</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                {calender}
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <Modal
        visible={detailVisible}
        visibleFunc={detailVisibleFunc}
        title='배치 상세로그'
        content={detailContent}
      />
    </>
  )
};

export default Log;