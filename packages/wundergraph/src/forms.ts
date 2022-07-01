import {
  Template,
  TemplateOutputFile,
  formatTypeScript,
  ResolvedWunderGraphConfig,
} from '@wundergraph/sdk'
import { OperationType } from '@wundergraph/protobuf'
import Handlebars from 'handlebars'
import { template } from './forms.tsx.template'

import {
  hasInput,
  isNotInternal,
} from '@wundergraph/sdk/dist/codegen/templates/typescript/react'
import { JsonSchema } from '@wundergraph/sdk/dist/codegen/templates/typescript/jsonschema'

export class AutoFormTemplate implements Template {
  generate(config: ResolvedWunderGraphConfig): Promise<TemplateOutputFile[]> {
    const liveQueries: Operation[] = config.application.Operations.filter(
      hasInput
    )
      .filter(isNotInternal)
      .filter(
        (op) =>
          op.OperationType === OperationType.QUERY &&
          op.LiveQuery?.enable === true
      )
      .map((op) => ({
        name: op.Name,
        inputType: op.Name + 'Input',
        responseType: op.Name + 'Response',
      }))
    const queries: Operation[] = config.application.Operations.filter(hasInput)
      .filter(isNotInternal)
      .filter((op) => op.OperationType === OperationType.QUERY)
      .map((op) => ({
        name: op.Name,
        inputType: op.Name + 'Input',
        responseType: op.Name + 'Response',
      }))
    const mutations: Operation[] = config.application.Operations.filter(
      hasInput
    )
      .filter(isNotInternal)
      .filter((op) => op.OperationType === OperationType.MUTATION)
      .map((op) => ({
        name: op.Name,
        inputType: op.Name + 'Input',
        responseType: op.Name + 'Response',
      }))
    const subscriptions: Operation[] = config.application.Operations.filter(
      hasInput
    )
      .filter(isNotInternal)
      .filter((op) => op.OperationType === OperationType.SUBSCRIPTION)
      .map((op) => ({
        name: op.Name,
        inputType: op.Name + 'Input',
        responseType: op.Name + 'Response',
      }))
    const modelImports: string = config.application.Operations.filter(hasInput)
      .filter(isNotInternal)
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
    if (mutations.length !== 0) {
      hooks.push('useMutation')
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
      mutations,
      hasMutations: mutations.length !== 0,
      subscriptions,
      hasSubscriptions: subscriptions.length !== 0,
      hasHookImports:
        queries.length + mutations.length + subscriptions.length !== 0,
      hasModelImports:
        queries.length + mutations.length + subscriptions.length !== 0,
      modelImports,
      hookImports,
    }
    const tmpl = Handlebars.compile(template)
    const content = tmpl(model)
    return Promise.resolve([
      {
        path: 'saas-ui-forms.tsx',
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
  hasMutations: boolean
  hasQueries: boolean
  hasLiveQueries: boolean
  hasSubscriptions: boolean
  mutations: Operation[]
  queries: Operation[]
  liveQueries: Operation[]
  subscriptions: Operation[]
}
