"use client";

import { Show, TextField, DateField, NumberField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export default function ApplicationShow() {
    const { query } = useShow();
    const { data, isLoading } = query;
    const record = data?.data;

    return (
        <Show isLoading={isLoading}>
            <Title level={5}>Name</Title>
            <TextField value={record?.name} />

            <Title level={5}>URL Doc Base</Title>
            <TextField value={record?.urlDocBase} />

            <Title level={5}>Description</Title>
            <TextField value={record?.description} />

            <Title level={5}>Crawl Frequency (days)</Title>
            <NumberField value={record?.crawlFreqDays} />

            <Title level={5}>Status</Title>
            <TextField value={record?.status} />

            <Title level={5}>Last Crawl</Title>
            <DateField value={record?.lastCrawlAt} />

            <Title level={5}>Created At</Title>
            <DateField value={record?.createdAt} />
        </Show>
    );
}
