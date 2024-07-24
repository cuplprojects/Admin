import { faker } from '@faker-js/faker';

import { BasicStatus, PermissionType } from '#/enum';

/**
 * User permission mock
 */
// parent 1
const SUPER_ADMIN = {
  id: '1',
  parentId: '',
  label: 'SuperAdmin',
  name: 'superadmin',
  icon: 'ic-analysis',
  type: PermissionType.CATALOGUE,
  route: 'superadmin',
  order: 7,
  children: [
    {
      id: '1.1',
      parentId: '1',
      label: 'AlertPage',
      name: 'AlertPage',
      type: PermissionType.MENU,
      route: 'AlertPage',
      component: '/SuperAdmin/AlertMessage/index.tsx',
    },
  ],
};

// parent 2
const DASHBOARD_PERMISSION = {
  id: '2',
  parentId: '',
  label: 'sys.menu.dashboard',
  name: 'Dashboard',
  icon: 'ic-analysis',
  type: PermissionType.CATALOGUE,
  route: 'dashboard',
  order: 1,
  children: [
    {
      id: '2.1',
      parentId: '2',
      label: 'sys.menu.workbench',
      name: 'Workbench',
      type: PermissionType.MENU,
      route: 'workbench',
      component: '/dashboard/workbench/index.tsx',
    },
    {
      id: '2.2',
      parentId: '2',
      label: 'sys.menu.analysis',
      name: 'Analysis',
      type: PermissionType.MENU,
      route: 'analysis',
      component: '/dashboard/analysis/index.tsx',
    },
  ],
};

// parent 3 
const DEVELOPER_PERMISSION = {
  id: '3',
  parentId: '',
  label: 'sys.menu.system.permission',
  name: 'Permission',
  type: PermissionType.MENU,
  route: 'permission', // This is the route for managing permissions
  component: '/management/system/permission/index.tsx',
};

// parent 4
const MANAGEMENT_PERMISSION = {
  id: '4',
  parentId: '',
  label: 'sys.menu.management',
  name: 'Management',
  icon: 'ic-management',
  type: PermissionType.CATALOGUE,
  route: 'management',
  order: 2,
  children: [
    {
      id: '4.1',
      parentId: '4',
      label: 'sys.menu.user.index',
      name: 'User',
      type: PermissionType.CATALOGUE,
      route: 'user',
      children: [
        // {
        //   id: '4754063958766648',
        //   parentId: '2781684678535711',
        //   label: 'sys.menu.profile',
        //   name: 'Profile',
        //   type: PermissionType.MENU,
        //   route: 'profile',
        //   component: '/management/user/profile/index.tsx',
        // },
        {
          id: '4.1.1',
          parentId: '4.1',
          label: 'sys.menu.user.AddUser',
          name: 'AddUser',
          type: PermissionType.MENU,
          route: 'AddUser',
          component: '/management/user/account/index.tsx',
        },
      ],
    },
    {
      id: '4.2',
      parentId: '4',
      label: 'sys.menu.system.index',
      name: 'System',
      type: PermissionType.CATALOGUE,
      route: 'system',
      children: [
        // {
        //   id: '1985890042972842',
        //   parentId: '0249937641030250',
        //   label: 'sys.menu.system.organization',
        //   name: 'Organization',
        //   type: PermissionType.MENU,
        //   route: 'organization',
        //   component: '/management/system/organization/index.tsx',
        // },
        {
          id: '4.2.1',
          parentId: '4.2',
          label: 'sys.menu.system.permission',
          name: 'Permission',
          type: PermissionType.MENU,
          route: 'permission',
          component: '/management/system/permission/index.tsx',
        },
        {
          id: '4.2.2',
          parentId: '4.2',
          label: 'sys.menu.system.role',
          name: 'Role',
          type: PermissionType.MENU,
          route: 'role',
          component: '/management/system/role/index.tsx',
        },
        {
          id: '4.2.3',
          parentId: '4.2',
          label: 'sys.menu.user.allusers',
          name: 'allusers',
          type: PermissionType.MENU,
          route: 'allusers',
          component: '/management/system/user/index.tsx',
        },
        // {
        //   id: '0157880245365434',
        //   parentId: '0249937641030250',
        //   label: 'sys.menu.system.user_detail',
        //   name: 'User Detail',
        //   type: PermissionType.MENU,
        //   route: 'user/:id',
        //   component: '/management/system/user/detail.tsx',
        //   hide: true,
        // },
        // {
        //   id: '0157880245365435',
        //   parentId: '0249937641030250',
        //   label: 'users',
        //   name: 'All Users',
        //   type: PermissionType.MENU,
        //   route: 'allusers',
        //   component: '/management/system/alluser/index.tsx',
        //   hide: true,
        // },
      ],
    },
  ],
};

// parent 5 
const COMPONENTS_PERMISSION = {
  id: '5',
  parentId: '',
  label: 'sys.menu.components',
  name: 'Components',
  icon: 'solar:widget-5-bold-duotone',
  type: PermissionType.CATALOGUE,
  route: 'components',
  order: 3,
  children: [
    {
      id: '5.1',
      parentId: '5',
      label: 'sys.menu.icon',
      name: 'Icon',
      type: PermissionType.MENU,
      route: 'icon',
      component: '/',
    },
    {
      id: '5.2',
      parentId: '5',
      label: 'sys.menu.profile',
      name: 'Profile',
      type: PermissionType.MENU,
      route: 'profile',
      component: '/components/profile/Profile.tsx',
    },
    {
      id: '5.3',
      parentId: '5',
      label: 'sys.menu.testcomponent',
      name: 'testcomponent',
      type: PermissionType.MENU,
      route: 'test',
      component: '/components/testcomponent/index.tsx',
    },
    {
      id: '5.4',
      parentId: '5',
      label: 'sys.menu.animate',
      name: 'Animate',
      type: PermissionType.MENU,
      route: 'animate',
      component: '/components/animate/index.tsx',
    },
    {
      id: '5.5',
      parentId: '5',
      label: 'sys.menu.scroll',
      name: 'Scroll',
      type: PermissionType.MENU,
      route: 'scroll',
      component: '/components/scroll/index.tsx',
    },
    // {
    //   id: '1755562695856395',
    //   parentId: '2271615060673773',
    //   label: 'sys.menu.markdown',
    //   name: 'Markdown',
    //   type: PermissionType.MENU,
    //   route: 'markdown',
    //   component: '/components/markdown/index.tsx',
    // },
    {
      id: '5.6',
      parentId: '5',
      label: 'sys.menu.editor',
      name: 'Editor',
      type: PermissionType.MENU,
      route: 'editor',
      component: '/components/editor/index.tsx',
    },
    {
      id: '5.7',
      parentId: '5',
      label: 'sys.menu.i18n',
      name: 'Multi Language',
      type: PermissionType.MENU,
      route: 'i18n',
      component: '/components/multi-language/index.tsx',
    },
    {
      id: '5.8',
      parentId: '5',
      label: 'sys.menu.upload',
      name: 'upload',
      type: PermissionType.MENU,
      route: 'Upload',
      component: '/components/upload/index.tsx',
    },
    {
      id: '5.9',
      parentId: '5',
      label: 'sys.menu.chart',
      name: 'Chart',
      type: PermissionType.MENU,
      route: 'chart',
      component: '/components/chart/index.tsx',
    },
  ],
};

// parent 6
const FUNCTIONS_PERMISSION = {
  id: '6',
  parentId: '',
  label: 'sys.menu.functions',
  name: 'functions',
  icon: 'solar:plain-2-bold-duotone',
  type: PermissionType.CATALOGUE,
  route: 'functions',
  order: 4,
  children: [
    // {
    //   id: '3667930780705750',
    //   parentId: '8132044808088488',
    //   label: 'sys.menu.clipboard',
    //   name: 'Clipboard',
    //   type: PermissionType.MENU,
    //   route: 'clipboard',
    //   component: '/components/icon/index.tsx',
    // },
    {
      id: '6.1',
      parentId: '6',
      label: 'sys.menu.imageannotation',
      name: 'Image Annotation',
      type: PermissionType.MENU,
      route: 'imageannotation',
      component: '/functions/imageannotation/index.tsx',
    },
  ],
};

// parent 7
const MENU_LEVEL_PERMISSION = {
  id: '7',
  parentId: '',
  label: 'sys.menu.Masters',
  name: 'Masters',
  icon: 'ic-menulevel',
  type: PermissionType.CATALOGUE,
  route: 'Masters',
  order: 5,
  children: [
    {
      id: '7.1',
      parentId: '7',
      label: 'sys.menu.projects',
      name: 'Projects',
      type: PermissionType.MENU,
      route: 'Projects',
      component: '/Masters/Projects/index.tsx',
    },
    {
      id: '7.2',
      parentId: '7',
      label: 'sys.menu.fields',
      name: 'Fields',
      type: PermissionType.MENU,
      route: 'Fields',
      component: '/Masters/Fields/index.tsx',
    },
   
    
  ],
};

// parent 8
const ERRORS_PERMISSION = {
  id: '8',
  parentId: '',
  label: 'sys.menu.error.index',
  name: 'Error',
  icon: 'bxs:error-alt',
  type: PermissionType.CATALOGUE,
  route: 'error',
  order: 6,
  children: [
    // {
    //   id: '8557056851997154',
    //   parentId: '8',
    //   label: 'sys.menu.error.403',
    //   name: '403',
    //   type: PermissionType.MENU,
    //   route: '403',
    //   component: '/sys/error/Page403.tsx',
    // },
    {
      id: '8.1',
      parentId: '8',
      label: 'sys.menu.error.404',
      name: '404',
      type: PermissionType.MENU,
      route: '404',
      component: '/sys/error/Page404.tsx',
    },
    {
      id: '8.2',
      parentId: '8',
      label: 'sys.menu.error.500',
      name: '500',
      type: PermissionType.MENU,
      route: '500',
      component: '/sys/error/Page500.tsx',
    },
  ],
};

// parent 9 
const OTHERS_PERMISSION = [

  {
    id: '9',
    parentId: '',
    label: 'Project Dashboard',
    name: 'ProjectDashboard',
    icon: 'hugeicons:audit-01',
    type: PermissionType.MENU,
    route: 'ProjectDashboard',
    component: '/ProjectDashboard/index.tsx',

  },
  //ProjectConfig Permission --Akshaya
  {
    id: '10',
    parentId: '',
    label: 'sys.menu.ProjectConfig',
    name: 'ProjectConfig',
    icon: 'carbon:cloud-satellite-config',
    type: PermissionType.MENU,
    route: 'ProjectConfig',
    component: '/ProjectConfig/index.tsx',
  },

  // IMPORTS PERMISSION
  {
    id: '11',
    parentId: '',
    label: 'sys.menu.AllImports',
    name: 'Imports',
    icon: 'solar:upload-square-bold-duotone',
    type: PermissionType.MENU,
    route: 'AllImports',
    component: '/Imports/index.tsx',
  },

  {
    id: '12',
    parentId: '',
    label: 'sys.menu.GenerateScore',
    name: 'ScoreProcessing',
    icon: 'solar:checklist-minimalistic-bold-duotone',
    type: PermissionType.MENU,
    route: 'GenerateScore',
    component: '/ScoreProcessing/index.tsx',

  },
  //Audit
  {
    id: '13',
    parentId: '',
    label: 'sys.menu.Audit',
    name: 'Audit',
    icon: 'hugeicons:audit-01',
    type: PermissionType.MENU,
    route: 'AuditPage/Audit',
    component: '/AuditPage/index.tsx',

  },
  
//   {
//     id: '3981225257359246',
//     parentId: '',
//     label: 'sys.menu.calendar',
//     name: 'Calendar',
//     icon: 'solar:calendar-bold-duotone',
//     type: PermissionType.MENU,
//     route: 'calendar',
//     component: '/sys/others/calendar/index.tsx',
//   },
//   {
//     id: '3513985683886393',
//     parentId: '',
//     label: 'sys.menu.kanban',
//     name: 'kanban',
//     icon: 'solar:clipboard-bold-duotone',
//     type: PermissionType.MENU,
//     route: 'kanban',
//     component: '/sys/others/kanban/index.tsx',
//   },
//   {
//     id: '5455837930804461',
//     parentId: '',
//     label: 'sys.menu.disabled',
//     name: 'Disabled',
//     icon: 'ic_disabled',
//     type: PermissionType.MENU,
//     route: 'disabled',
//     status: BasicStatus.DISABLE,
//     component: '/sys/others/calendar/index.tsx',
//   },
//   {
//     id: '7728048658221587',
//     parentId: '',
//     label: 'sys.menu.label',
//     name: 'Label',
//     icon: 'ic_label',
//     type: PermissionType.MENU,
//     route: 'label',
//     newFeature: true,
//     component: '/sys/others/blank.tsx',
//   },

  // correctin window
  {
    id: '14',
    parentId: '',
    label: 'sys.menu.correctionwindow',
    name: 'correction',
    icon: 'solar:document-add-bold-duotone',
    type: PermissionType.MENU,
    route: 'correction',
    component: '/correction/index.tsx',
  },
  {
    id: '15',
    parentId: '',
    label: 'Ambiguity',
    name: 'Ambiguity',
    icon: 'solar:document-add-bold-duotone',
    type: PermissionType.MENU,
    route: 'Ambiguity',
    component: '/Ambiguity/index.tsx',
  },

  {
    id: '16',
    parentId: '',
    label: 'Report',
    name: 'Report',
    icon: 'solar:document-add-bold-duotone',
    type: PermissionType.MENU,
    route:'Report',
    component: '/Report/index.tsx',
  },
  {
    id: '17',
    parentId: '',
    label: 'Archive',
    name: 'Archive',
    icon: 'solar:document-add-bold-duotone',
    type: PermissionType.MENU,
    route:'Archive',
    component: '/Archive/index.tsx',
  },


  //   {
  //     id: '3513985683886393',
  //     parentId: '',
  //     label: 'sys.menu.kanban',
  //     name: 'kanban',
  //     icon: 'solar:clipboard-bold-duotone',
  //     type: PermissionType.MENU,
  //     route: 'kanban',
  //     component: '/sys/others/kanban/index.tsx',
  //   },
  //   {
  //     id: '5455837930804461',
  //     parentId: '',
  //     label: 'sys.menu.disabled',
  //     name: 'Disabled',
  //     icon: 'ic_disabled',
  //     type: PermissionType.MENU,
  //     route: 'disabled',
  //     status: BasicStatus.DISABLE,
  //     component: '/sys/others/calendar/index.tsx',
  //   },
  //   {
  //     id: '7728048658221587',
  //     parentId: '',
  //     label: 'sys.menu.label',
  //     name: 'Label',
  //     icon: 'ic_label',
  //     type: PermissionType.MENU,
  //     route: 'label',
  //     newFeature: true,
  //     component: '/sys/others/blank.tsx',
  //   },

  // {
  //   id: '3981225257359246',
  //   parentId: '',
  //   label: 'sys.menu.calendar',
  //   name: 'Calendar',
  //   icon: 'solar:calendar-bold-duotone',
  //   type: PermissionType.MENU,
  //   route: 'calendar',
  //   component: '/sys/others/calendar/index.tsx',
  // },
  // {
  //   id: '3513985683886393',
  //   parentId: '',
  //   label: 'sys.menu.kanban',
  //   name: 'kanban',
  //   icon: 'solar:clipboard-bold-duotone',
  //   type: PermissionType.MENU,
  //   route: 'kanban',
  //   component: '/sys/others/kanban/index.tsx',
  // },
  // {
  //   id: '5455837930804461',
  //   parentId: '',
  //   label: 'sys.menu.disabled',
  //   name: 'Disabled',
  //   icon: 'ic_disabled',
  //   type: PermissionType.MENU,
  //   route: 'disabled',
  //   status: BasicStatus.DISABLE,
  //   component: '/sys/others/calendar/index.tsx',
  // },
  // {
  //   id: '7728048658221587',
  //   parentId: '',
  //   label: 'sys.menu.label',
  //   name: 'Label',
  //   icon: 'ic_label',
  //   type: PermissionType.MENU,
  //   route: 'label',
  //   newFeature: true,
  //   component: '/sys/others/blank.tsx',
  // },
  // {
  //   id: '5733704222120995',
  //   parentId: '',
  //   label: 'sys.menu.frame',
  //   name: 'Frame',
  //   icon: 'ic_external',
  //   type: PermissionType.CATALOGUE,
  //   route: 'frame',
  //   children: [
  //     {
  //       id: '9884486809510480',
  //       parentId: '5733704222120995',
  //       label: 'sys.menu.external_link',
  //       name: 'External Link',
  //       type: PermissionType.MENU,
  //       route: 'external_link',
  //       hideTab: true,
  //       component: '/sys/others/iframe/external-link.tsx',
  //       frameSrc: 'https://ant.design/',
  //     },
  //     {
  //       id: '9299640886731819',
  //       parentId: '5733704222120995',
  //       label: 'sys.menu.iframe',
  //       name: 'Iframe',
  //       type: PermissionType.MENU,
  //       route: 'frame',
  //       component: '/sys/others/iframe/index.tsx',
  //       frameSrc: 'https://ant.design/',
  //     },
  //   ],
  // },
  // {
  //   id: '0941594969900756',
  //   parentId: '',
  //   label: 'sys.menu.blank',
  //   name: 'Disabled',
  //   icon: 'ic_blank',
  //   type: PermissionType.MENU,
  //   route: 'blank',
  //   component: '/sys/others/blank.tsx',
  // },
];

export const PERMISSION_LIST = [
  DASHBOARD_PERMISSION,
  MANAGEMENT_PERMISSION,
  // COMPONENTS_PERMISSION,
  //FUNCTIONS_PERMISSION,
  MENU_LEVEL_PERMISSION,
  // ERRORS_PERMISSION,
  ...OTHERS_PERMISSION,
  SUPER_ADMIN
];

/**
 * User role mock
 */
const ADMIN_ROLE = {
  id: '4281707933534332',
  name: 'Admin',
  label: 'admin',
  status: BasicStatus.ENABLE,
  order: 1,
  desc: 'Super Admin',
  permission: PERMISSION_LIST,
};
const TEST_ROLE = {
  id: '9931665660771476',
  name: 'Test',
  label: 'test',
  status: BasicStatus.ENABLE,
  order: 2,
  desc: 'test',
  permission: [DASHBOARD_PERMISSION, COMPONENTS_PERMISSION, FUNCTIONS_PERMISSION],
};
const DEVELOPER_ROLE = {
  id: '9931665660771472',
  name: 'Developer',
  label: 'developer',
  status: BasicStatus.ENABLE,
  order: 2,
  desc: 'developer',
  permission: [...PERMISSION_LIST, DEVELOPER_PERMISSION],
};
export const ROLE_LIST = [ADMIN_ROLE, TEST_ROLE, DEVELOPER_ROLE];

/**
 * User data mock
 */

export const DEFAULT_USER = {
  id: 'b34719e1-ce46-457e-9575-99505ecee828',
  username: 'admin',
  email: 'shivom@chandrakala.co.in',
  avatar: faker.image.avatarLegacy(),
  createdAt: faker.date.anytime(),
  updatedAt: faker.date.recent(),
  password: 'demo1234',
  role: ADMIN_ROLE,
  permissions: ADMIN_ROLE.permission,
};
export const TEST_USER = {
  id: 'efaa20ea-4dc5-47ee-a200-8a899be29494',
  username: 'test',
  password: 'demo1234',
  // email: faker.internet.email(),
  email: 'shivom@chandrakala.co.in',
  avatar: faker.image.avatarLegacy(),
  createdAt: faker.date.anytime(),
  updatedAt: faker.date.recent(),
  role: TEST_ROLE,
  permissions: TEST_ROLE.permission,
};
export const DEVELOPER_USER = {
  id: 'efaa20ea-4dc5-47ee-a200-8a899be54213',
  username: 'shivom',
  password: 'demo1234',
  email: 'shivom@chandrakala.co.in',
  avatar: faker.image.avatarLegacy(),
  createdAt: faker.date.anytime(),
  updatedAt: faker.date.recent(),
  role: DEVELOPER_ROLE,
  permissions: DEVELOPER_ROLE.permission,
};
export const USER_LIST = [DEFAULT_USER, TEST_USER, DEVELOPER_USER];
