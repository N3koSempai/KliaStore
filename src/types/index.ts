export type Category = string;

export interface CategoryResponse {
	categories: Category[];
}

export interface AppOfTheWeek {
	app_id: string;
	position: number;
	isFullscreen: boolean;
}

export interface AppsOfTheWeekResponse {
	apps: AppOfTheWeek[];
}

export interface AppSummary {
	arches: string[];
	branch: string;
	metadata: {
		sdk?: string;
		base?: string;
		name: string;
		command?: string;
		runtime?: string;
		permissions?: {
			shared?: string[];
			devices?: string[];
			sockets?: string[];
			"session-bus"?: {
				talk?: string[];
			};
		};
		"built-extensions"?: string[];
		runtimeIsEol?: boolean;
	};
	timestamp: number;
	download_size: number;
	installed_size: number;
}

export interface AppOfTheWeekWithDetails extends AppOfTheWeek {
	name?: string;
	icon?: string;
	summary?: AppSummary;
	appStream?: AppStream;
}

export interface AppStream {
	id: string;
	name: string;
	summary: string;
	description?: string;
	icon?: string;
	icons?: Array<{
		url: string;
		type: string;
		width: string;
		height: string;
	}>;
	screenshots?: Array<{
		url: string;
	}>;
}
