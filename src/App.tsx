import { useContext, useEffect } from 'react'
import { graphql, ChildDataProps } from 'react-apollo'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import {
  Projects,
  Stack,
  Body,
  Case,
  // Background,
  Footer,
} from './components'
import { IProject, IStack, IContact, IContent } from './types'
import query from './query'
import { Context } from './context'
import { Types } from './reducers'

const Main = styled.main`
  padding: 0 30px 50px;
`

const Loading = styled(Main)`
  padding: 30px;
`

type Response = {
  contents?: IContent[]
  projects?: IProject[]
  recent?: IProject[]
  experiments?: IProject[]
  techStacks?: IStack[]
  contacts?: IContact[]
}

type ChildProps = ChildDataProps<{}, Response, {}>

const App = ({
  data: { contents, projects, recent, experiments, techStacks, contacts, loading, error },
}: ChildProps) => {
  const {
    state: { project },
    dispatch,
  } = useContext(Context)

  const location = useLocation()

  useEffect(() => {
    const pagesFlat = [...(projects || []), ...(recent || []), ...(experiments || [])].reduce(
      (acc: Record<string, any>, p: IProject) => {
        if (p.id) {
          acc[p.id] = p
        }
        return acc
      },
      {}
    )

    if (location.pathname.match(/\/case\//g)) {
      const id = location.pathname.replace(/\/case\//, '')
      dispatch({ type: Types.CHANGE_PROJECT, payload: { project: pagesFlat[id] } })
    } else {
      dispatch({ type: Types.CHANGE_PROJECT, payload: { project: null } })
    }
  }, [location, dispatch, projects, recent, experiments])

  if (loading) return <Loading>Loading...</Loading>
  if (error) return <Loading>{JSON.stringify(error)}</Loading>

  return (
    <Main>
      {/* <Background /> */}
      <Body data={contents ? contents.find(c => c.type === 'intro')!.content : undefined} />
      <Projects
        title="Recent Work"
        subTitle="...get in touch for more recent work..."
        data={recent}
      />
      <Projects title="Featured Work" data={projects} />
      <Projects title="Experiments" data={experiments} />
      <Stack data={techStacks} />
      <Body
        title="Awards"
        data={contents ? contents.find(c => c.type === 'awards')!.content : undefined}
      />
      <Body
        title="Publications"
        data={contents ? contents.find(c => c.type === 'publications')!.content : undefined}
      />
      {project && <Case />}
      <Footer data={contacts} />
    </Main>
  )
}

export default graphql<{}, Response, {}, ChildProps>(query)(App)
