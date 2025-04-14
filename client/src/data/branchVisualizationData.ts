interface BranchNode {
  name: string;
  attributes?: {
    commit?: string;
    message?: string;
    timestamp?: string;
    type?: 'branch' | 'merge';
  };
  children?: BranchNode[];
}

export const basicBranchingExample: BranchNode = {
  name: 'main',
  attributes: {
    commit: 'Initial commit',
    message: 'Project setup',
    timestamp: '2024-03-25T10:00:00Z',
  },
  children: [
    {
      name: 'feat',
      attributes: { type: 'branch' },
      children: [
        {
          name: 'feat',
          attributes: { type: 'merge' },
        },
      ],
    },
  ],
};

export const mergingExample: BranchNode = {
  name: 'main',
  attributes: {
    commit: 'Initial commit',
    message: 'Project setup',
    timestamp: '2024-03-25T10:00:00Z',
  },
  children: [
    {
      name: 'feat/profile',
      attributes: { type: 'branch' },
      children: [
        {
          name: 'feat/profile',
          attributes: { type: 'merge' },
        },
      ],
    },
    {
      name: 'feat/settings',
      attributes: { type: 'branch' },
      children: [
        {
          name: 'feat/settings',
          attributes: { type: 'merge' },
        },
      ],
    },
  ],
};

export const advancedWorkflowExample: BranchNode = {
  name: 'main',
  attributes: {
    commit: 'Initial commit',
    message: 'Project setup',
    timestamp: '2024-03-25T10:00:00Z',
  },
  children: [
    {
      name: 'develop',
      attributes: { type: 'branch' },
      children: [
        {
          name: 'feat/auth',
          attributes: { type: 'branch' },
          children: [
            {
              name: 'feat/auth',
              attributes: { type: 'merge' },
            },
          ],
        },
        {
          name: 'feat/api',
          attributes: { type: 'branch' },
          children: [
            {
              name: 'feat/api',
              children: [
                {
                  name: 'bugfix/api-auth',
                  attributes: { type: 'branch' },
                  children: [
                    {
                      name: 'bugfix/api-auth',
                      attributes: { type: 'merge' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'release/v1.0',
          attributes: { type: 'branch' },
          children: [
            {
              name: 'hotfix/v1.0.1',
              attributes: { type: 'branch' },
              children: [
                {
                  name: 'hotfix/v1.0.1',
                  attributes: { type: 'merge' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}; 