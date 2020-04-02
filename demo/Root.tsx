import * as React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles, Theme } from '@material-ui/core/styles'
import debounce from 'lodash/debounce'
import classNames from 'classnames'
import { dateGoggles } from '../src'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: '1 1 auto',
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    alignContent: 'stretch',
  },
  input: {
    flex: '0 0 50%',
    display: 'flex',
    flexDirection: 'column',
  },
  output: {
    flex: '0 0 50%',
    display: 'flex',
    flexDirection: 'column',
  },
  textarea: {
    flex: '1 1 auto',
    fontFamily: 'monospace',
    fontSize: theme.typography.pxToRem(14),
  },
  error: {
    color: 'red',
  },
}))

const example = `[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
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
  replace: true } }
`

export default function Root(): React.ReactNode {
  const classes = useStyles()
  const [input, setInput] = React.useState(example)
  const [output, setOutput] = React.useState<string | Error>('')
  const [updating, setUpdating] = React.useState(false)

  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value)
    },
    [setInput]
  )

  const updateOutput = React.useMemo(
    () =>
      debounce((input: string): void => {
        let converted: string | Error
        try {
          converted = dateGoggles(input)
        } catch (error) {
          converted = error
        }
        setOutput(converted)
        setUpdating(false)
      }, 250),
    [setOutput, setUpdating]
  )

  React.useEffect(() => {
    setUpdating(true)
    updateOutput(input)
  }, [input, setUpdating, updateOutput])

  return (
    <div className={classes.root}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6">date-goggles</Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.main}>
        <div className={classes.input}>
          <Typography variant="h6" color="initial">
            Input
          </Typography>
          <textarea
            value={input}
            className={classes.textarea}
            onChange={handleInputChange}
          />
        </div>
        <div className={classes.output}>
          <Typography variant="h6" color="initial">
            Output
          </Typography>
          {updating ? (
            <CircularProgress variant="indeterminate" />
          ) : (
            <textarea
              value={output instanceof Error ? output.message : output}
              readOnly
              className={classNames(classes.textarea, {
                [classes.error]: output instanceof Error,
              })}
            />
          )}
        </div>
      </div>
    </div>
  )
}
