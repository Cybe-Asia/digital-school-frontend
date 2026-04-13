export type AdmissionsAdminSummaryCard = {
  labelKey: string;
  value: string;
  helperKey: string;
};

export type AdmissionsAdminPipelineColumn = {
  titleKey: string;
  count: number;
  items: Array<{
    studentName: string;
    parentName: string;
    detailKey: string;
    badgeKey: string;
  }>;
};

export type AdmissionsAdminQueueItem = {
  titleKey: string;
  count: string;
  helperKey: string;
  ctaKey: string;
};

export type AdmissionsAdminTimelineItem = {
  time: string;
  titleKey: string;
  detailKey: string;
};

export type AdmissionsAdminDashboard = {
  summaryCards: AdmissionsAdminSummaryCard[];
  pipeline: AdmissionsAdminPipelineColumn[];
  priorityQueues: AdmissionsAdminQueueItem[];
  upcomingItems: AdmissionsAdminTimelineItem[];
};
