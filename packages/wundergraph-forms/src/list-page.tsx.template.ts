//language=handlebars
export const template = `
import React, {useEffect, useState, useRef, useCallback, useMemo} from "react";
{{#if hasModelImports}}import { {{modelImports}} } from "./models";{{/if}}
{{#if hasHookImports}}import { {{hookImports}} } from "./nextjs";{{/if}}
import { QueryResult } from "@wundergraph/nextjs"
import jsonSchema from "./jsonschema";
import {HStack, Button, Spinner, Spacer} from '@chakra-ui/react'
import {useModals} from '@saas-ui/react'
import {
    Page,
    PageProps,
    PageBody,
    Toolbar,
    DataGridPagination,
    TableInstance,
    FiltersProvider,
    FiltersAddButton,
    Filter,
    FilterItem,
    NoFilteredResults,
    ActiveFiltersList,
    useDataGridFilter
} from "@saas-ui/pro"
import { Filters } from 'react-table'

{{#if dataGridImports}}import { {{dataGridImports}} } from './saas-ui-data-grid'{{/if}}

const inputToFilters = (input) => {
	return Object.entries(input.properties).map(([id, prop]) => {
		return {
			id,
			label: prop.title || id,
			type: prop.type[0]
		}
	})
}

interface ListPageProps extends PageProps {

}

{{#each queries}}
export const {{name}}Page: React.FC<ListPageProps> = (props) => {
    const { toolbar: toolbarProp, children, ...rest } = props
    const modals = useModals()
    const gridRef = useRef<TableInstance<{{responseType}}>>(null)

    const filters = useMemo(() => {
        return inputToFilters(jsonSchema.{{name}}.input)
    }, [])

    const onFilter = useCallback((filters: Filter[]) => {
        console.log(gridRef.current, filters)
        gridRef.current?.setAllFilters(
            filters.map((filter) => {
                return {
                    id: filter.id,
                    value: {
                        value: filter.value,
                        operator: filter.operator,
                    },
                }
            }) as Filters<{{responseType}}>,
        )
    }, [])

    const onBeforeEnableFilter = React.useCallback(
        (activeFilter: Filter, filter: FilterItem): Promise<Filter> => {
            return new Promise((resolve, reject) => {
                const { key, id, value } = activeFilter
                const { type, label } = filter
                if (type === 'string' && !value) {
                    const modal = modals.form({
                        title: label,
                        schema: {
                            value: {
                                label: 'Value',
                                type: 'string',
                                rules: {
                                    required: true
                                }
                            }
                        },
                        onSubmit: async (data) => {
                            await resolve({ key, id, value: data.value, operator: 'is' })

                            modals.closeAll()
                        },
                        onClose: () => reject(),
                    })

                    return
                }

                resolve(activeFilter)
            })
        },
        [],
    )

    const buttonProps = {
        variant: 'outline'
    }

    const toolbar = (
        <Toolbar>
            <FiltersAddButton buttonProps={buttonProps} />
            <Spacer />
 
            {toolbarProp}
        </Toolbar>
    )

    return (
        <FiltersProvider
            filters={filters}
            onChange={onFilter}
            onBeforeEnableFilter={onBeforeEnableFilter}
        >
            <Page title="{{name}}" toolbar={toolbar} {...rest}>
                <ActiveFiltersList />
                
                {children}

                <PageBody contentWidth="full">
                    <{{name}}DataGrid ref={gridRef}>
                        <DataGridPagination />
                    </{{name}}DataGrid>
                </PageBody>
            </Page>
        </FiltersProvider>
    )
}
{{/each}}
`
