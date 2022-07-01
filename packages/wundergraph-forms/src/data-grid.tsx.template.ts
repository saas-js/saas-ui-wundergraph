//language=handlebars
export const template = `
import React, { useEffect, useState, useRef, useCallback } from "react";
{{#if hasModelImports}}import { {{modelImports}} } from "./models";{{/if}}
{{#if hasHookImports}}import { {{hookImports}} } from "./nextjs";{{/if}}
import { QueryResult } from "@wundergraph/nextjs"
import jsonSchema from "./jsonschema";
import { forwardRef } from '@chakra-ui/react'

import {
    DataGrid,
    DataGridProps,
    TableInstance,
    NoFilteredResults,
    useDataGridFilter,
    useFiltersContext
} from "@saas-ui/pro"
import { Filters, IdType } from 'react-table'

const jsonSchemaToColumns = ({ items }: any) => {
  return Object.entries<any>(items.properties)
    .filter(([key, item]) => {
      return !['array', 'object'].includes(item.type)
    })
    .map(([key, item]) => {
      return {
        id: key,
        Header: key,
        filter: useDataGridFilter(item.type)
      }
    })
}

const filtersToInput = (filters?: Filters[]) => {
    const input = {
        filters: JSON.stringify(filters)
    }

    filters?.forEach((filter) => {
        input[filter.id] = filter.value
    })

    return input
}

{{#each queries}}
export const {{name}}DataGrid = forwardRef<DataGridProps<{{responseType}}Data>, TableInstance<{{responseType}}Data>>((props, ref) => {
    const { activeFilters } = useFiltersContext()

    const {result, refetch} = useQuery.{{name}}({input: filtersToInput(activeFilters)});

    const columns = jsonSchemaToColumns(
        jsonSchema.{{name}}.response.properties.data.properties.{{dataKey}}
    )

    return (
        <DataGrid<{{responseType}}Data>
            isHoverable
            {...props}
            ref={ref}
            data={result.data?.{{dataKey}} || []}
            noResults={NoFilteredResults}
            columns={columns}
        >
        </DataGrid>
    )
})
{{/each}}

`
