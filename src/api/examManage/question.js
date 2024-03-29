/* eslint-disable no-unused-vars */
import { del, get, post, put } from '@/router/axios'
import axios from 'axios'
/**
 * 获取题库列表
 * @param {Object} params - 参数
 * @param {String} params.pageNo - 请求页码
 * @param {String} params.pageSize - 每页条数
 * @param {String} params.status - 状态
 * @param {String} params.type - 类型
 * @param {String} params.search
 * */
export const getQuestionList = (params) => get('/manage/v1/question/list', params)
/**
 * 获取题库列表
 * @param {Object} params - 参数
 * @param {String} params.pageNo - 请求页码
 * @param {String} params.pageSize - 每页条数
 * @param {String} params.status - 状态
 * @param {String} params.type - 类型
 * @param {String} params.search
 * */
export const exportQuestionList = (params) =>
  get('/manage/v1/question/export', params, { responseType: 'blob' })

/**
 * 新增试题
 * @param {*} params
 */
export const createQuestion = (params) => post('/manage/v1/question', params)
/**
 * 修改试题
 * @param {*} params
 */
export const modifyQuestion = (params) => put('/manage/v1/question', params)

/**
 * 获取试题
 * @param {*} params
 * @param {*} params.id
 */
export const getQuestion = (params) => get('/manage/v1/question', params)

/**
 * 删除试题
 * @param {*} params
 * @param {*} params.id
 */
export const delQuestion = (params) => post('/manage/v1/question/del', params)
/**
 * 获取试题分类
 * @param {*} params
 */
export const getQuestionCategory = (params) => get('/manage/v1/evaluation/category/tree', params)

/**
 * 题库预导入
 * @param {*} params
 */
export const uploadQuestionFile = (params) => post('/manage/v1/question/read', params)

/**
 * 错误的题库导出
 * @param {*} params
 */
export const exportErrorReport = (params) =>
  get('/api/manage/v1/errorQuestionExcelImport', params, { responseType: 'blob' })
