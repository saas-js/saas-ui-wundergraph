//language=handlebars
export const template = `
import React, {useEffect, useState} from "react";
{{#if hasModelImports}}import { {{modelImports}} } from "./models";{{/if}}
{{#if hasHookImports}}import { {{hookImports}} } from "./nextjs";{{/if}}
import { QueryResult } from "@wundergraph/nextjs"
import jsonSchema from "./jsonschema";
import { AutoForm, FormProps } from "@saas-ui/react";
import { jsonSchemaForm } from "@saas-ui/forms/ajv";

export interface WunderFormProps<I, T> extends Omit<FormProps<I>, 'onSubmit' | 'defaultValues> {
    defaultValues: I
    onResult?: (result: QueryResult<T>) => void
}
export interface WunderMutationFormProps<I, T> extends WunderFormProps<I, T> {
    refetchMountedQueriesOnSuccess?: boolean
}
{{#each mutations}}
export const {{name}}Form: React.FC<WunderMutationFormProps<{{inputType}}, {{responseType}}Data>> = (props) => {
    const {onResult, refetchMountedQueriesOnSuccess, ...formProps} = props
    const {mutate,result} = useMutation.{{name}}({refetchMountedQueriesOnSuccess});
    useEffect(()=>{
        onResult?.(result);
    },[result]);
    return (
        <AutoForm<{{inputType}}>
            {...jsonSchemaForm(jsonSchema.{{name}}.input)}
            {...formProps}
            onSubmit={async (data) => {
                await mutate({input: data, refetchMountedQueriesOnSuccess});
            }}/>
    )
}
{{/each}}

{{#each queries}}
export const {{name}}Form: React.FC<WunderFormProps<{{inputType}}, {{responseType}}Data>> = (props) => {
    const {onResult, defaultValues, ...formProps} = props
    const {result,refetch} = useQuery.{{name}}({lazy: true, input: defaultValues});
    useEffect(()=>{
        onResult?.(result);
    },[result]);
    return (
        <AutoForm<{{inputType}}>
            {...jsonSchemaForm(jsonSchema.{{name}}.input)}
            {...formProps}
            defaultValues={defaultValues}
            onSubmit={async (data) => {
                await refetch({input: data})
            }}/>
    )
}
{{/each}}

{{#each liveQueries}}
export const {{name}}LiveForm: React.FC<WunderFormProps<{{inputType}}, {{responseType}}Data>> = (props) => {
    const {onResult, defaultValues, ...formProps} = props
    const [formData, setFormData] = useState<{{inputType}}>(defaultValues);
    const {result} = useLiveQuery.{{name}}({input: formData});
    useEffect(()=>{
        onResult?.(result);
    },[result]);
    return (
        <AutoForm<{{inputType}}>
            {...jsonSchemaForm(jsonSchema.{{name}}.input)}
            {...formProps}
            defaultValues={defaultValues}
            onSubmit={async (data) => {
                setFormData(data)
            }}/>
    )
}
{{/each}}

{{#each subscriptions}}
export const {{name}}SubscriptionForm: React.FC<WunderFormProps<{{inputType}}, {{responseType}}Data>> = (props) => {
    const {onResult, defaultValues, ...formProps} = props
    const [formData,setFormData] = useState<{{inputType}}>(defaultValues);
    const {result} = useSubscription.{{name}}({input: formData});
    useEffect(()=>{
        onResult?.(result);
    },[result]);
    return (
        <AutoForm<{{inputType}}>
            {...jsonSchemaForm(jsonSchema.{{name}}.input)}
            {...formProps}
            defaultValues={defaultValues}
            onSubmit={async (data) => {
                setFormData(data)
            }}/>
    )
}
{{/each}}
`
