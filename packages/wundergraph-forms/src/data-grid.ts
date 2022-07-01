import {
  Template,
  TemplateOutputFile,
  formatTypeScript,
  ResolvedWunderGraphConfig,
} from '@wundergraph/sdk'
import { OperationType } from '@wundergraph/protobuf'
import Handlebars from 'handlebars'
import { template } from './data-grid.tsx.template'

import {
  hasInput,
  isNotInternal,
} from '@wundergraph/sdk/dist/codegen/templates/typescript/react'
import { JsonSchema } from '@wundergraph/sdk/dist/codegen/templates/typescript/jsonschema'

const isList = (op) => op.Name.match(/^List/)

export class DataGridTemplate implements Template {
  generate(config: ResolvedWunderGraphConfig): Promise<TemplateOutputFile[]> {
    const liveQueries: Operation[] = config.application.Operations.filter(
      hasInput
    )
      // .filter(isNotInternal)
      .filter(isList)
      .filter(
        (op) =>
          op.OperationType === OperationType.QUERY &&
          op.Name.match(/^List/) &&
          op.LiveQuery?.enable === true
      )
      .map((op) => ({
        name: op.Name,
        inputType: op.Name + 'Input',
        responseType: op.Name + 'Response',
      }))
    const queries: Operation[] = config.application.Operations.filter(hasInput)
      // .filter(isNotInternal)
      .filter(isList)
      .filter(
        (op) =>
          op.OperationType === OperationType.QUERY && op.Name.match(/^List/)
      )
      .map((op) => ({
        name: op.Name,
        inputType: op.Name + 'Input',
        responseType: op.Name + 'Response',
        dataKey: Object.entries(
          op.ResponseSchema.properties.data.properties
        )[0][0],
      }))
    const subscriptions: Operation[] = config.application.Operations.filter(
      hasInput
    )
      .filter(isNotInternal)
      .filter(isList)
      .filter((op) => op.OperationType === OperationType.SUBSCRIPTION)
      .map((op) => ({
        name: op.Name,
        inputType: op.Name + 'Input',
        responseType: op.Name + 'Response',
      }))
    const modelImports: string = config.application.Operations.filter(hasInput)
      .filter(isNotInternal)
      .filter(isList)
      .map(
        (op) =>
          op.Name + 'Input,' + op.Name + 'Response, ' + op.Name + 'ResponseData'
      )
      .join(',')
    const hooks: string[] = []
    if (queries.length !== 0) {
      hooks.push('useQuery')
    }
    if (liveQueries.length !== 0) {
      hooks.push('useLiveQuery')
    }
    if (subscriptions.length !== 0) {
      hooks.push('useSubscription')
    }
    const hookImports: string = hooks.join(',')
    const model: Model = {
      liveQueries,
      hasLiveQueries: liveQueries.length !== 0,
      queries,
      hasQueries: queries.length !== 0,
      subscriptions,
      hasSubscriptions: subscriptions.length !== 0,
      hasHookImports: queries.length + subscriptions.length !== 0,
      hasModelImports: queries.length + subscriptions.length !== 0,
      modelImports,
      hookImports,
    }
    const tmpl = Handlebars.compile(template)
    const content = tmpl(model)
    return Promise.resolve([
      {
        path: 'saas-ui-data-grid.tsx',
        content: formatTypeScript(content),
        doNotEditHeader: true,
      },
    ])
  }

  dependencies(): Template[] {
    return [new JsonSchema()]
  }
}

interface Operation {
  name: string
  inputType: string
  responseType: string
}

interface Model {
  hasModelImports: boolean
  hasHookImports: boolean
  hookImports: string
  modelImports: string
  hasQueries: boolean
  hasLiveQueries: boolean
  hasSubscriptions: boolean
  queries: Operation[]
  liveQueries: Operation[]
  subscriptions: Operation[]
}
