type ImportRow = {
    id: number;
    lastName: string;
    firstName: string;
    name: string;
    telephone: string;
    privateMail: string;
    schoolMail: string;
    timetable: number;
};

type Action = {
    error?: string;
    success?: string;
    action: null;
};

type ActionState = {
    error?: string | null;
    isLoading: boolean;
};

type BasicActionState = ActionState & {
    result?: {
        message: string;
    } | null;
};

type CreateUserActionState = ActionState & {
    result?: ResponseUser | null;
};

type CreateUserACLActionState = ActionState & {
    result?: ResponseACL | null;
};

type CreateProjectsActionState = ActionState & {
    result?: ResponseProject[] | null;
};

type CreateResourcePoolActionState = ActionState & {
    result?: ResponseResourcePool | null;
};

type ActiveUser = ImportRow & {
    actions: {
        createUser: CreateUserActionState;
        debug: BasicActionState;
        createACL: CreateUserACLActionState;
        createProjects: CreateProjectsActionState;
        createRP: CreateResourcePoolActionState;
    };
    importedAt: Date;
};

type CreateUser = {
    username: string;
    is_active: boolean;
    email: string;
    full_name: string;
    password: string;
};

type ResponseUser = {
    username: string;
    is_active: boolean;
    email: string;
    full_name: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    last_login: string;
    is_superadmin: boolean;
    password: string | null;
};

type AuthLogin = {
    username: string;
    password: string;
};

type ResponseLogin = {
    access_token: string;
    token_type: string;
};

type ResponseError = {
    message: string;
};

type CreateProject = {
    name: string;
    status: string;
    auto_close: boolean;
    auto_open: boolean;
    auto_start: boolean;
    scene_height: number;
    scene_width: number;
    zoom: number;
    show_layers: boolean;
    snap_to_grid: boolean;
    show_grid: boolean;
    grid_size: number;
    drawing_grid_size: number;
    show_interface_labels: boolean;
    supplier: {
        logo: string;
        url: string;
    } | null;
    variables:
        | {
              name: string;
              value: string;
          }[]
        | null;
};

enum ProjectStatus {
    OPENED = "opened",
}

type ResponseProject = CreateProject & {
    project_id: string;
    status: ProjectStatus;
    filename: string;
};

type CreateResourcePool = {
    name: string;
};

type ResponseResourcePool = {
    name: string;
    created_at: string;
    updated_at: string;
    resource_pool_id: string;
};

type CreateACL = {
    ace_type: string;
    path: string;
    propagate: boolean;
    allowed: boolean;
    user_id: string;
    group_id: string | null;
    role_id: string;
};

type ResponseACL = {
    ace_type: string;
    path: string;
    propagate: boolean;
    allowed: boolean;
    user_id: string;
    group_id: string;
    role_id: string;
    created_at: string;
    updated_at: string;
    ace_id: string;
};

export type {
    ImportRow,
    ActiveUser,
    Action,
    CreateUser,
    ResponseUser,
    AuthLogin,
    ResponseLogin,
    CreateProject,
    CreateResourcePool,
    ResponseResourcePool,
    CreateACL,
    ResponseACL,
    ActionState,
    CreateUserActionState,
    CreateUserACLActionState,
    CreateProjectsActionState,
    ResponseProject,
    ProjectStatus,
    CreateResourcePoolActionState,
    ResponseError,
};
