/* eslint-env mocha */

import { parse, format } from './'
import { expect } from 'chai'

function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

describe(`parse`, function() {
  it(`default options`, function() {
    const out = parse(`[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ 1585777672134, 1585778400000 ],
      v: [ 'Stuffing', null ],
      beginTime: 1585777672134,
      endTime: 1585789200000,
      replace: true } }
 [2020-04-01 18:32:23 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ 1585777672134, 1585778400000 ],
      v: [ 'Stuffing', null ],
      beginTime: 1585777672134,
      endTime: 1585778400000,
      replace: true } }`)
    expect(out).to.deep.equal([
      `[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ `,
      new Date(1585777672134),
      ', ',
      new Date(1585778400000),
      ` ],
      v: [ 'Stuffing', null ],
      beginTime: `,
      new Date(1585777672134),
      `,
      endTime: `,
      new Date(1585789200000),
      `,
      replace: true } }
 [2020-04-01 18:32:23 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ `,
      new Date(1585777672134),
      ', ',
      new Date(1585778400000),
      ` ],
      v: [ 'Stuffing', null ],
      beginTime: `,
      new Date(1585777672134),
      `,
      endTime: `,
      new Date(1585778400000),
      `,
      replace: true } }`,
    ])
  })
  it(`automatically tries seconds if units not given and no ms timestamps found`, function() {
    const out = parse(
      `[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ 1585777672, 1585778400 ],
      v: [ 'Stuffing', null ],
      beginTime: 1585777672,
      endTime: 1585789200,
      replace: true } }
 [2020-04-01 18:32:23 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ 1585777672, 1585778400 ],
      v: [ 'Stuffing', null ],
      beginTime: 1585777672,
      endTime: 1585778400,
      replace: true } }`
    )
    expect(out).to.deep.equal([
      `[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ `,
      new Date(1585777672000),
      ', ',
      new Date(1585778400000),
      ` ],
      v: [ 'Stuffing', null ],
      beginTime: `,
      new Date(1585777672000),
      `,
      endTime: `,
      new Date(1585789200000),
      `,
      replace: true } }
 [2020-04-01 18:32:23 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ `,
      new Date(1585777672000),
      ', ',
      new Date(1585778400000),
      ` ],
      v: [ 'Stuffing', null ],
      beginTime: `,
      new Date(1585777672000),
      `,
      endTime: `,
      new Date(1585778400000),
      `,
      replace: true } }`,
    ])
  })
  it(`automatically assumes seconds if min/max are second timestamps within [-10, +5] years`, function() {
    const out = parse(
      `[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ 1585777672, 1585778400 ],
      v: [ 'Stuffing', null ],
      beginTime: 1585777672,
      endTime: 1585789200,
      replace: true } }
 [2020-04-01 18:32:23 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ 1585777672, 1585778400 ],
      v: [ 'Stuffing', null ],
      beginTime: 1585777672,
      endTime: 1585778400,
      replace: true } }`,
      {
        min: Math.floor(addYears(new Date(), -9).getTime() / 1000),
        max: Math.floor(addYears(new Date(), 4).getTime() / 1000),
      }
    )
    expect(out).to.deep.equal([
      `[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ `,
      new Date(1585777672000),
      ', ',
      new Date(1585778400000),
      ` ],
      v: [ 'Stuffing', null ],
      beginTime: `,
      new Date(1585777672000),
      `,
      endTime: `,
      new Date(1585789200000),
      `,
      replace: true } }
 [2020-04-01 18:32:23 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ `,
      new Date(1585777672000),
      ', ',
      new Date(1585778400000),
      ` ],
      v: [ 'Stuffing', null ],
      beginTime: `,
      new Date(1585777672000),
      `,
      endTime: `,
      new Date(1585778400000),
      `,
      replace: true } }`,
    ])
  })
  it(`automatically assumes milliseconds if min/max are not second timestamps within [-10, +5] years`, function() {
    const out = parse(
      `[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ 1585777672134, 1585778400000 ],
      v: [ 'Stuffing', null ],
      beginTime: 1585777672134,
      endTime: 1585789200000,
      replace: true } }
 [2020-04-01 18:32:23 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ 1585777672134, 1585778400000 ],
      v: [ 'Stuffing', null ],
      beginTime: 1585777672134,
      endTime: 1585778400000,
      replace: true } }`,
      {
        min: addYears(new Date(), -9).getTime(),
        max: addYears(new Date(), 4).getTime(),
      }
    )
    expect(out).to.deep.equal([
      `[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ `,
      new Date(1585777672134),
      ', ',
      new Date(1585778400000),
      ` ],
      v: [ 'Stuffing', null ],
      beginTime: `,
      new Date(1585777672134),
      `,
      endTime: `,
      new Date(1585789200000),
      `,
      replace: true } }
 [2020-04-01 18:32:23 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ `,
      new Date(1585777672134),
      ', ',
      new Date(1585778400000),
      ` ],
      v: [ 'Stuffing', null ],
      beginTime: `,
      new Date(1585777672134),
      `,
      endTime: `,
      new Date(1585778400000),
      `,
      replace: true } }`,
    ])
  })
  it(`seconds`, function() {
    const out = parse(
      `[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ 1585777672, 1585778400 ],
      v: [ 'Stuffing', null ],
      beginTime: 1585777672,
      endTime: 1585789200,
      replace: true } }
 [2020-04-01 18:32:23 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ 1585777672, 1585778400 ],
      v: [ 'Stuffing', null ],
      beginTime: 1585777672,
      endTime: 1585778400,
      replace: true } }`,
      { unit: 'seconds' }
    )
    expect(out).to.deep.equal([
      `[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ `,
      new Date(1585777672000),
      ', ',
      new Date(1585778400000),
      ` ],
      v: [ 'Stuffing', null ],
      beginTime: `,
      new Date(1585777672000),
      `,
      endTime: `,
      new Date(1585789200000),
      `,
      replace: true } }
 [2020-04-01 18:32:23 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ `,
      new Date(1585777672000),
      ', ',
      new Date(1585778400000),
      ` ],
      v: [ 'Stuffing', null ],
      beginTime: `,
      new Date(1585777672000),
      `,
      endTime: `,
      new Date(1585778400000),
      `,
      replace: true } }`,
    ])
  })
  it(`excludes numbers outside of range`, function() {
    const begin = new Date()
    begin.setFullYear(begin.getFullYear() - 1)
    const end = new Date()
    end.setFullYear(end.getFullYear() + 1)
    expect(
      parse(
        `${begin.getTime() -
          1} ${begin.getTime()} ${end.getTime()} ${end.getTime() + 1}`,
        {
          min: begin,
          max: end,
        }
      )
    ).to.deep.equal([
      `${begin.getTime() - 1} `,
      begin,
      ' ',
      end,
      ` ${end.getTime() + 1}`,
    ])
  })
  it(`doesn't enforce range when bounds are null`, function() {
    expect(
      parse(`0 1 100 1000 100000000000000`, { min: null, max: null })
    ).to.deep.equal([
      new Date(0),
      ' ',
      new Date(1),
      ' ',
      new Date(100),
      ' ',
      new Date(1000),
      ' ',
      new Date(100000000000000),
    ])
  })
  it(`no lower bound`, function() {
    expect(parse(`0 1 100 1000 100000000000000`, { min: null })).to.deep.equal([
      new Date(0),
      ' ',
      new Date(1),
      ' ',
      new Date(100),
      ' ',
      new Date(1000),
      ' 100000000000000',
    ])
  })
  it(`no upper bound`, function() {
    expect(parse(`0 1 100 1000 100000000000000`, { max: null })).to.deep.equal([
      '0 1 100 1000 ',
      new Date(100000000000000),
    ])
  })
})

describe(`format`, function() {
  it(`custom formatDate`, function() {
    expect(
      format(
        [
          `[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ `,
          new Date(1585777672134),
          ', ',
          new Date(1585778400000),
          ` ],
      v: [ 'Stuffing', null ],
      beginTime: `,
          new Date(1585777672134),
          `,
      endTime: `,
          new Date(1585789200000),
          `,
      replace: true } }
 [2020-04-01 18:32:23 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ `,
          new Date(1585777672134),
          ', ',
          new Date(1585778400000),
          ` ],
      v: [ 'Stuffing', null ],
      beginTime: `,
          new Date(1585777672134),
          `,
      endTime: `,
          new Date(1585778400000),
          `,
      replace: true } }`,
        ],
        { formatDate: (date: Date) => String(date.getTime()) }
      )
    ).to
      .equal(`[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ 1585777672134, 1585778400000 ],
      v: [ 'Stuffing', null ],
      beginTime: 1585777672134,
      endTime: 1585789200000,
      replace: true } }
 [2020-04-01 18:32:23 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
    { t: [ 1585777672134, 1585778400000 ],
      v: [ 'Stuffing', null ],
      beginTime: 1585777672134,
      endTime: 1585778400000,
      replace: true } }`)
  })
})
