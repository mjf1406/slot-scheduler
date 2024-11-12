import { Suspense } from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import TimetablesClient from "./components/TimetablesClient";
import { timetablesOptions } from "~/app/api/queryOptions";
import LoadingPage from "~/components/Loading";

export default async function MyTimetablesPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(timetablesOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentLayout title="Timetables">
        <Suspense fallback={<LoadingPage />}>
          <TimetablesClient />
        </Suspense>
      </ContentLayout>
    </HydrationBoundary>
  );
}
