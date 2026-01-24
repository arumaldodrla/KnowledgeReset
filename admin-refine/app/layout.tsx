"use client";

import React from "react";
import "./utils/silence-warnings";

import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider from "@refinedev/nextjs-router";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App as AntdApp } from "antd";
import { ThemedLayout, ThemedTitle, useNotificationProvider } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import { dataProvider } from "./providers/data-provider";
import { authProvider } from "./providers/auth-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RefineKbarProvider>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "#1890ff",
                },
              }}
            >
              <AntdApp>
                <React.Suspense fallback="Loading...">
                  <Refine
                    routerProvider={routerProvider}
                    dataProvider={dataProvider}
                    authProvider={authProvider}
                    notificationProvider={useNotificationProvider}
                    resources={[
                      {
                        name: "applications",
                        list: "/applications",
                        create: "/applications/create",
                        edit: "/applications/edit/:id",
                        show: "/applications/show/:id",
                        meta: {
                          label: "Applications",
                        },
                      },
                      {
                        name: "crawlJobs",
                        list: "/crawl-jobs",
                        show: "/crawl-jobs/show/:id",
                        meta: {
                          label: "Crawl Jobs",
                        },
                      },
                      {
                        name: "users",
                        list: "/users",
                        create: "/users/create",
                        edit: "/users/edit/:id",
                        meta: {
                          label: "Users",
                        },
                      },
                      {
                        name: "documents",
                        list: "/documents",
                        show: "/documents/show/:id",
                        meta: {
                          label: "Documents",
                        },
                      },
                      {
                        name: "roles",
                        list: "/roles",
                        meta: {
                          label: "Roles",
                        },
                      },
                    ]}
                    options={{
                      syncWithLocation: true,
                      warnWhenUnsavedChanges: true,
                    }}
                  >
                    <ThemedLayout
                      Title={({ collapsed }: { collapsed: boolean }) => (
                        <ThemedTitle
                          collapsed={collapsed}
                          text="Knowledge Reset"
                        />
                      )}
                    >
                      {children}
                    </ThemedLayout>
                    <RefineKbar />
                  </Refine>
                </React.Suspense>
              </AntdApp>
            </ConfigProvider>
          </AntdRegistry>
        </RefineKbarProvider>
      </body>
    </html>
  );
}
