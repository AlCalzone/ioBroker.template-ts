﻿import fs = require("fs");

declare global {
	namespace ioBroker {

		interface DictionaryLike<T> {
			[id: string]: T;
		}

		enum StateQuality {
			good = 0x00, // or undefined or null
			bad = 0x01,
			general_problem = 0x01,
			general_device_problem = 0x41,
			general_sensor_problem = 0x81,
			device_not_connected = 0x42,
			sensor_not_connected = 0x82,
			device_reports_error = 0x44,
			sensor_reports_error = 0x84,
		}

		interface State {
			/** The value of the state. */
			val: any;

			/** Direction flag: false for desired value and true for actual value. Default: false. */
			ack: boolean;

			/** Unix timestamp. Default: current time */
			ts: number;

			/** Unix timestamp of the last time the value changed */
			lc: number;

			/** Name of the adapter instance which set the value, e.g. "system.adapter.web.0" */
			from: string;

			/** Optional time in seconds after which the state is reset to null */
			expire?: number;

			/** Optional quality of the state value */
			q?: StateQuality;

			/** Optional comment */
			c?: string;
		}

		type States = any; // TODO implement

		type ObjectType = "state" | "channel" | "device";
		type CommonType = "number" | "string" | "boolean" | "array" | "object" | "mixed" | "file";

		interface ObjectCommon {
			/** name of this object */
			name: string;
		}

		interface StateCommon extends ObjectCommon {
			/** Type of this state. See https://github.com/ioBroker/ioBroker/blob/master/doc/SCHEMA.md#state-commonrole for a detailed description */
			type?: CommonType;
			/** minimum value */
			min?: number;
			/** maximum value */
			max?: number;
			/** unit of the value */
			unit?: string;
			/** the default value */
			def?: any;
			/** description of this state */
			desc?: string;

			/** if this state is readable */
			read: boolean;
			/** if this state is writable */
			write: boolean;
			/** role of the state (used in user interfaces to indicate which widget to choose) */
			role: string;

			/**
			 * Dictionary of possible values for this state in the form
			 * <pre>
			 * {
			 *     "internal value 1": "displayed value 1",
			 *     "internal value 2": "displayed value 2",
			 *     ...
			 * }
			 * </pre>
			 * In old ioBroker versions, this could also be a string of the form
			 * "val1:text1;val2:text2" (now deprecated)
			 */
			states?: DictionaryLike<string> | string;

			/** ID of a helper state indicating if the handler of this state is working */
			workingID?: string;

			/** attached history information */
			history?: any;
		}
		interface ChannelCommon extends ObjectCommon {
			/** role of the channel */
			role?: string;
			/** description of this channel */
			desc?: string;
		}

		type Object = {
			/** The ID of this object */
			_id?: string;
			native: DictionaryLike<any>;
			enums?: DictionaryLike<string>;
			type: "state";
			common: StateCommon;
		} | {
			/** The ID of this object */
			_id?: string;
			native: DictionaryLike<any>;
			enums?: DictionaryLike<string>;
			type: "channel";
			common: ChannelCommon;
		} | {
			/** The ID of this object */
			_id?: string;
			native: DictionaryLike<any>;
			enums?: DictionaryLike<string>;
			type: "device";
			common: ObjectCommon; // TODO: any definition for device?
		};

		// DEFINITION of ACL, Users, and Objects:
		// https://github.com/ioBroker/ioBroker.js-controller/blob/master/lib/objects/objectsInMemServer.js

		/** Defines access rights for a single object type */
		interface ACLFragment {
			/** Whether a user may enumerate objects of this type */
			list: boolean;
			/** Whether a user may read objects of this type */
			read: boolean;
			/** Whether a user may write objects of this type */
			write: boolean;
			/** Whether a user may create objects of this type */
			create: boolean;
			/** Whether a user may delete objects of this type */
			"delete": boolean;
		}

		/** Defines all access rights a user or group has */
		interface ACL {
			/** The access rights for files */
			file: ACLFragment;
			/** The access rights for objects */
			object: ACLFragment;
			/** The access rights for users/groups */
			users: ACLFragment;
		}

		type UserGroup = any; // TODO find out how this looks like
		// interface UserGroup { }

		/** Contains information about a user */
		interface User {
			/** Which groups this user belongs to */
			groups: UserGroup[];
			/** Access rights of this user */
			acl: ACL;
		}

		/** Provides low-level access to ioBroker objects */
		interface Objects {
			/**
			 * For a given user, returns the groups he belongs to, and his access rights
			 * @param user Name of the user. Has to start with "system.user."
			 * @param callback The callback function to be invoked with the return values
			 */
			getUserGroup(user: string, callback: GetUserGroupCallback): void;

			/**
			 * Determines the mime type for a given file extension
			 * @param ext File extension, including the leading dot, e.g. ".zip"
			 */
			getMimeType(ext: string): {mimeType: string, isBinary: boolean};

			/**
			 * Writes a file.
			 * @param id Name of the root directory. This should be the adapter instance, e.g. "admin.0"
			 * @param name File name
			 * @param data Contents of the file
			 * @param options (optional) MIME type of the file (string). Or some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			writeFile(id: string, name: string, data: Buffer | string, callback: GenericCallback): void;
			writeFile(id: string, name: string, data: Buffer | string, options: string | any, callback: GenericCallback): void;

			/**
			 * Reads a file.
			 * @param id Name of the root directory. This should be the adapter instance, e.g. "admin.0"
			 * @param name File name
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			readFile(id: string, name: string, callback: ReadFileCallback): void;
			readFile(id: string, name: string, options: any, callback: ReadFileCallback): void;

			/**
			 * Deletes a file.
			 * @param id Name of the root directory. This should be the adapter instance, e.g. "admin.0"
			 * @param name File name
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			unlink(id: string, name: string, callback: GenericCallback): void;
			unlink(id: string, name: string, options: any, callback: GenericCallback): void;
			/**
			 * Deletes a file.
			 * @param id Name of the root directory. This should be the adapter instance, e.g. "admin.0"
			 * @param name File name
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			delFile(id: string, name: string, callback: GenericCallback): void;
			delFile(id: string, name: string, options: any, callback: GenericCallback): void;

			/**
			 * Finds all files and directories starting with <name>
			 * @param id Name of the root directory. This should be the adapter instance, e.g. "admin.0"
			 * @param name File or directory name
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			readDir(id: string, name: string, callback: ReadDirCallback): void;
			readDir(id: string, name: string, options: any, callback: ReadDirCallback): void;

			/**
			 * Renames a file or directory
			 * @param id Name of the root directory. This should be the adapter instance, e.g. "admin.0"
			 * @param oldName Old file or directory name
			 * @param newName Name to rename to
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			rename(id: string, oldName: string, newName: string, callback: GenericCallback): void;
			rename(id: string, oldName: string, newName: string, options: any, callback: GenericCallback): void;

			/**
			 * Creates an empty file with the given name
			 * @param id Name of the root directory. This should be the adapter instance, e.g. "admin.0"
			 * @param name File name
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			touch(id: string, name: string, callback: GenericCallback): void;
			touch(id: string, name: string, options: any, callback: GenericCallback): void;

			/**
			 * Deletes all files in the root directory matching <name>
			 * @param id Name of the root directory. This should be the adapter instance, e.g. "admin.0"
			 * @param name Pattern to match against
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			rm(id: string, name: string, callback: RmCallback): void;
			rm(id: string, name: string, options: any, callback: RmCallback): void;

			/**
			 * Creates an empty directory with the given name
			 * @param id Name of the root directory. This should be the adapter instance, e.g. "admin.0"
			 * @param name Directory name
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			mkDir(id: string, name: string, callback: GenericCallback): void;
			mkDir(id: string, name: string, options: any, callback: GenericCallback): void;

			/**
			 * Takes possession all files in the root directory matching <name>
			 * @param id Name of the root directory. This should be the adapter instance, e.g. "admin.0"
			 * @param name Pattern to match against
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			chownFile(id: string, name: string, callback: ChownFileCallback): void;
			chownFile(id: string, name: string, options: any, callback: ChownFileCallback): void;

			/**
			 * Changes access rights of all files in the root directory matching <name>
			 * @param id Name of the root directory. This should be the adapter instance, e.g. "admin.0"
			 * @param name Pattern to match against
			 * @param options Mode of the access change as a number or hexadecimal string
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			chmodFile(id: string, name: string, options: {mode: number | string} | DictionaryLike<any>, callback: ChownFileCallback): void;

			// not documented. enabled = true seems to disable the cache
			// enableFileCache(enabled, options, callback)

			/**
			 * Subscribe to object changes
			 * @param pattern The pattern to match against
			 */
			subscribeConfig(pattern: string, callback: () => void): void;
			subscribeConfig(pattern: string, options: any, callback: () => void): void;
			/**
			 * Subscribe to object changes
			 * @param pattern The pattern to match against
			 */
			subscribe(pattern: string, callback: () => void): void;
			subscribe(pattern: string, options: any, callback: () => void): void;

			/**
			 * Unsubscribe from object changes
			 * @param pattern The pattern to match against
			 */
			unsubscribeConfig(pattern: string, callback: () => void): void;
			unsubscribeConfig(pattern: string, options: any, callback: () => void): void;
			/**
			 * Unsubscribe from object changes
			 * @param pattern The pattern to match against
			 */
			unsubscribe(pattern: string, callback: () => void): void;
			unsubscribe(pattern: string, options: any, callback: () => void): void;

			/**
			 * Takes possession of all objects matching <pattern>
			 * @param pattern Pattern to match against
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			chownObject(pattern: string, callback: ChownObjectCallback): void;
			chownObject(pattern: string, options: any, callback: ChownObjectCallback): void;

			/**
			 * Changes access rights of all objects matching <pattern>
			 * @param pattern Pattern to match against
			 * @param options Mode of the access change as a number or hexadecimal string
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			chmodObject(pattern: string, callback: ChownObjectCallback): void;
			chmodObject(pattern: string, options: any, callback: ChownObjectCallback): void;

			/**
			 * Retrieves a copy of the object with the given ID
			 * @param id Id of the object to find
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			getObject(id: string, callback: GetObjectCallback): void;
			getObject(id: string, options: any, callback: GetObjectCallback): void;

			/**
			 * Returns a list of config keys matching <pattern>
			 * @param pattern Pattern to match against
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 * @param dontModify unused
			 */
			getConfigKeys(pattern: string, callback: GetConfigKeysCallback, dontModify: any): void;
			getConfigKeys(pattern: string, options: any, callback: GetConfigKeysCallback, dontModify: any): void;

			/**
			 * Returns a list of objects with the given ids
			 * @param keys IDs of the objects to be retrieved
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 * @param dontModify unused
			 */
			getObjects(keys: string[], callback: GetObjectsCallback2, dontModify: any): void;
			getObjects(keys: string[], options: any, callback: GetObjectsCallback2, dontModify: any): void;

			/**
			 * Creates or overwrites an object in the object db
			 * @param id ID of the object
			 * @param obj Object to store
			 * @param options (optional) Some internal options.
			 * @param callback Is called when the operation finished (successfully or not)
			 */
			setObject(id: string, obj: ioBroker.Object, callback: SetObjectCallback): void;
			setObject(id: string, obj: ioBroker.Object, options: any, callback: SetObjectCallback): void;
		}

		interface Logger {
			/** log message with debug level */
			debug(message: string): void;
			/** log message with info level (default output level for all adapters) */
			info(message: string): void;
			/** log message with warning severity */
			warn(message: string): void;
			/** log message with error severity */
			error(message: string): void;
		}

		interface Certificates {
			/** private key file */
			key: string | Buffer;
			/** public certificate */
			cert: string | Buffer;
			/** chained CA certificates */
			ca: (string | Buffer)[];
		}

		/** Callback information for a passed message */
		interface MessageCallbackInfo {
			/** The original message payload */
			message: string | object;
			/** ID of this callback */
			id: number;
			// ???
			ack: boolean;
			/** Timestamp of this message */
			time: number;
		}
		type MessageCallback = (result?: any) => void;

		/** A message being passed between adapter instances */
		interface Message {
			/** The command to be executed */
			command: string;
			/** The message payload */
			message: string | object;
			/** The source of this message */
			from: string;
			/** ID of this message */
			_id: number;
			/** Callback information. This is set when the source expects a response */
			callback: MessageCallbackInfo;
		}

		type EnumList = string | string[];

		type Enum = any; // TODO: implement this

		interface DirectoryEntry {
			file: string;
			stats: fs.Stats;
			isDir: boolean;
			acl: any; // access control list object
			modifiedAt: number;
			createdAt: number;
		}

		interface GetHistoryOptions {
			instance?: string;
			start?: number;
			end?: number;
			step?: number;
			count?: number;
			from?: boolean;
			ack?: boolean;
			q?: boolean;
			addID?: boolean;
			limit?: number;
			ignoreNull: boolean;
			sessionId?: any;
			aggregate?: "minmax" | "min" | "max" | "average" | "total" | "count" | "none";
		}

		interface AdapterOptions {
			/** The name of the adapter */
			name: string;

			/** path to adapter */
			dirname?: string;

			/** if the global system config should be included in the created object. Default: false */
			systemConfig?: boolean;

			/** provide alternative global configuration for the adapter. Default: null */
			config?: any;

			/** instance of the created adapter. Default: null */
			instance?: number;

			/** If the adapter needs access to the formatDate function to format dates according to the global settings. Default: false */
			useFormatDate?: boolean;

			/** If the adapter collects logs from all adapters (experts only). Default: false */
			logTransporter?: boolean;

			/** Handler for changes of subscribed objects */
			objectChange?: ObjectChangeHandler;
			/** Handler for received adapter messages. Can only be used if messagebox in io-package.json is set to true. */
			message?: MessageHandler;
			/** Handler for changes of subscribed states */
			stateChange?: StateChangeHandler;
			/** Will be called when the adapter is intialized */
			ready?: () => void;
			/** Will be called on adapter termination */
			unload?: (callback: () => void) => void;

			/** if true, stateChange will be called with an id that has no namespace, e.g. "state" instead of "adapter.0.state". Default: false */
			noNamespace?: boolean;
		} // end interface AdapterOptions

		interface Adapter {
			/** The name of the adapter */
			name: string;
			/** The name of the host where the adapter is running */
			host: string;
			/** instance number of this adapter instance */
			instance: number;
			/** Namespace of adapter objects: "<name>.<instance>" */
			readonly namespace: string;
			/** native part of the adapter settings */
			config: any;
			/** common part of the adapter settings */
			common: any;
			/** system part of the adapter settings */
			systemConfig?: any;
			/** path to the adapter folder */
			adapterDir: string;
			/** content of io-package.json */
			ioPack: any;
			/** content of package.json */
			pack: any;
			/** access to the logging functions */
			log: Logger;
			/** adapter version */
			version: any;
			states: States;
			objects: Objects;
			/** if the adapter is connected to the host */
			connected: boolean;

			/*	===============================
				Functions defined in adapter.js
				=============================== */

			/**
			 * Helper function that looks for first free TCP port starting with the given one.
			 * @param port - The port to start with
			 * @param callback - gets called when a free port is found
			 */
			getPort(port: number, callback: (port: number) => void): void;

			// ==============================
			// GENERAL

			/** Validates username and password */
			checkPassword(user: string, password: string, callback: (result: boolean) => void): void;
			checkPassword(user: string, password: string, options: any, callback: (result: boolean) => void): void;
			/** Sets a new password for the given user */
			setPassword(user: string, password: string, options?: any, callback?: (err?: any) => void): void;
			/** <INTERNAL> Checks if a user exists and is in the given group. */
			checkGroup(user: string, group: string, callback: (result: boolean) => void): void;
			checkGroup(user: string, group: string, options: any, callback: (result: boolean) => void): void;
			/** <INTERNAL> Determines the users permissions */
			// TODO: find out what the any types are here, maybe ACL?
			calculatePermissions(user: string, commandsPermissions: any, callback: (result: any) => void): void;
			calculatePermissions(user: string, commandsPermissions: any, options: any, callback: (result: any) => void): void;
			/** Returns SSL certificates by name (private key, public cert and chained certificate) for creation of HTTPS servers */
			getCertificates(publicName: string, privateName: string, chainedName: string, callback: (err: string, certs?: Certificates, useLetsEncryptCert?: boolean) => void): void;

			/**
			 * Sends a message to a specific instance or all instances of some specific adapter.
			 * If the ID of an instance is given (e.g. "admin.0"), only this instance will receive the message.
			 * If the name of an adapter is given (e.g. "admin"), all instances of this adapter will receive it.
			 */
			sendTo(instanceName: string, message: string | object, callback?: MessageCallback | MessageCallbackInfo): void;
			sendTo(instanceName: string, command: string, message: string | object, callback?: MessageCallback | MessageCallbackInfo): void;

			/**
			 * Sends a message to a specific host or all hosts.
			 */
			sendToHost(hostName: string, message: string | object, callback?: MessageCallback | MessageCallbackInfo): void;
			sendToHost(hostName: string, command: string, message: string | object, callback?: MessageCallback | MessageCallbackInfo): void;

			/** Convert ID to {device: D, channel: C, state: S} */
			idToDCS(id: string): {
				device: string;
				channel: string;
				state: string;
			};

			// ==============================
			// own objects

			/** Reads an object from the object db */
			getObject(id: string, callback: GetObjectCallback): void;
			getObject(id: string, options: any, callback: GetObjectCallback): void;
			/** Creates or overwrites an object in the object db */
			setObject(id: string, obj: ioBroker.Object, options?: any, callback?: SetObjectCallback): void;
			/** Creates an object in the object db. Existing objects are not overwritten. */
			setObjectNotExists(id: string, obj: ioBroker.Object, options?: any, callback?: SetObjectCallback): void;
			/** Get all states, channels and devices of this adapter */
			getAdapterObjects(callback: (objects: DictionaryLike<ioBroker.Object>) => void): void;
			/** Extend an object and create it if it might not exist */
			extendObject(id: string, objPart: Partial<ioBroker.Object>, options?: any, callback?: SetObjectCallback): void;
			/**
			 * Deletes an object from the object db
			 * @param id - The id of the object without namespace
			 */
			delObject(id: string, options?: any, callback?: GenericCallback): void;

			// ==============================
			// foreign objects

			// tslint:disable:unified-signatures
			/** Reads an object (which might not belong to this adapter) from the object db */
			getForeignObject(id: string, callback: GetObjectCallback): void;
			getForeignObject(id: string, options: any, callback: GetObjectCallback): void;
			/** Get foreign objects by pattern, by specific type and resolve their enums. */
			getForeignObjects(pattern: string, callback: GetObjectsCallback): void;
			getForeignObjects(pattern: string, options: any, callback: GetObjectsCallback): void;
			getForeignObjects(pattern: string, type: ObjectType, callback: GetObjectsCallback): void;
			getForeignObjects(pattern: string, type: ObjectType, enums: EnumList, callback: GetObjectsCallback): void;
			getForeignObjects(pattern: string, type: ObjectType, options: any, callback: GetObjectsCallback): void;
			getForeignObjects(pattern: string, type: ObjectType, enums: EnumList, options: any, callback: GetObjectsCallback): void;
			/** Creates or overwrites an object (which might not belong to this adapter) in the object db */
			setForeignObject(id: string, obj: ioBroker.Object, options?: any, callback?: SetObjectCallback): void;
			/** Creates an object (which might not belong to this adapter) in the object db. Existing objects are not overwritten. */
			setForeignObjectNotExists(id: string, obj: ioBroker.Object, options?: any, callback?: SetObjectCallback): void;
			/** Extend an object (which might not belong to this adapter) and create it if it might not exist */
			extendForeignObject(id: string, objPart: Partial<ioBroker.Object>, options?: any, callback?: SetObjectCallback): void;
			// tslint:enable:unified-signatures
			/**
			 * Finds an object by its ID or name
			 * @param type - common.type of the state
			 */
			findForeignObject(idOrName: string, type: string, callback: FindObjectCallback): void;
			findForeignObject(idOrName: string, type: string, options: any, callback: FindObjectCallback): void;
			/**
			 * Deletes an object (which might not belong to this adapter) from the object db
			 * @param id - The id of the object including namespace
			 */
			delForeignObject(id: string, options?: any, callback?: GenericCallback): void;

			// ==============================
			// states
			/** Writes a value into the states DB. */
			setState(id: string, state: string | number | boolean | State | Partial<State>, ack?: boolean, options?: any, callback?: SetStateCallback): void;
			/** Writes a value into the states DB only if it has changed. */
			setStateChanged(id: string, state: string | number | boolean | State | Partial<State>, ack?: boolean, options?: any, callback?: SetStateChangedCallback): void;
			/** Writes a value (which might not belong to this adapter) into the states DB. */
			setForeignState(id: string, state: string | number | boolean | State | Partial<State>, ack?: boolean, options?: any, callback?: SetStateCallback): void;
			/** Writes a value (which might not belong to this adapter) into the states DB only if it has changed. */
			setForeignStateChanged(id: string, state: string | number | boolean | State | Partial<State>, ack?: boolean, options?: any, callback?: SetStateChangedCallback): void;

			/** Read a value from the states DB. */
			getState(id: string, callback: GetStateCallback): void;
			getState(id: string, options: any, callback: GetStateCallback): void;
			/** Read a value (which might not belong to this adapter) from the states DB. */
			getForeignState(id: string, callback: GetStateCallback): void;
			getForeignState(id: string, options: any, callback: GetStateCallback): void;
			/** Read all states of this adapter which match the given pattern */
			getStates(pattern: string, callback: GetStatesCallback): void;
			getStates(pattern: string, options: any, callback: GetStatesCallback): void;
			/** Read all states (which might not belong to this adapter) which match the given pattern */
			getForeignStates(pattern: string, callback: GetStatesCallback): void;
			getForeignStates(pattern: string, options: any, callback: GetStatesCallback): void;

			/** Deletes a state from the states DB, but not the associated object. Consider using @link{deleteState} instead */
			delState(id: string, options?: any, callback?: GenericCallback): void;
			/** Deletes a state from the states DB, but not the associated object */
			delForeignState(id: string, options?: any, callback?: GenericCallback): void;

			getHistory(id: string, options: GetHistoryOptions, callback: GetHistoryCallback): void;

			// ==============================
			// enums

			/** Returns the enum tree, filtered by the optional enum name */
			getEnum(callback: GetEnumCallback): void;
			getEnum(name: string, callback: GetEnumCallback): void;
			getEnum(name: string, options: any, callback: GetEnumCallback): void;
			getEnums(callback: GetEnumsCallback): void;
			getEnums(enumList: EnumList, callback: GetEnumsCallback): void;
			getEnums(enumList: EnumList, options: any, callback: GetEnumsCallback): void;

			addChannelToEnum(enumName: string, addTo: string, parentDevice: string, channelName: string, options?: any, callback?: GenericCallback): void;

			deleteChannelFromEnum(enumName: string, parentDevice: string, channelName: string, options?: any, callback?: GenericCallback): void;

			addStateToEnum(enumName: string, addTo: string, parentDevice: string, parentChannel: string, stateName: string, options?: any, callback?: GenericCallback): void;

			deleteStateFromEnum(enumName: string, parentDevice: string, parentChannel: string, stateName: string, options?: any, callback?: GenericCallback): void;

			// ==============================
			// subscriptions

			/** Subscribe to changes of objects in this instance */
			subscribeObjects(pattern: string, options?: any): void;
			/** Subscribe to changes of objects (which might not belong to this adapter) */
			subscribeForeignObjects(pattern: string, options?: any): void;
			/** Unsubscribe from changes of objects in this instance */
			unsubscribeObjects(pattern: string, options?: any): void;
			/** Unsubscribe from changes of objects (which might not belong to this adapter) */
			unsubscribeForeignObjects(pattern: string, options?: any): void;

			/** Subscribe to changes of states in this instance */
			subscribeStates(pattern: string, options?: any, callback?: GenericCallback): void;
			/** Subscribe to changes of states (which might not belong to this adapter) */
			subscribeForeignStates(pattern: string, options?: any, callback?: GenericCallback): void;
			/**
			 * Subscribe from changes of states in this instance
			 * @param pattern - Must match the pattern used to subscribe
			 */
			unsubscribeStates(pattern: string, options?: any, callback?: GenericCallback): void;
			/**
			 * Subscribe from changes of states (which might not belong to this adapter)
			 * @param pattern - Must match the pattern used to subscribe
			 */
			unsubscribeForeignStates(pattern: string, options?: any, callback?: GenericCallback): void;

			// ==============================
			// devices and channels

			/** creates an object with type device */
			createDevice(deviceName: string, common?: any, native?: any, options?: any, callback?: SetObjectCallback): void;
			/** deletes a device, its channels and states */
			deleteDevice(deviceName: string, options?: any, callback?: GenericCallback): void;
			/** gets the devices of this instance */

			/** creates an object with type channel */
			createChannel(parentDevice: string, channelName: string, roleOrCommon?: string | object, native?: any, options?: any, callback?: SetObjectCallback): void;
			/** deletes a channel and its states */
			deleteChannel(channelName: string, options?: any, callback?: GenericCallback): void;
			deleteChannel(parentDevice: string, channelName: string, options?: any, callback?: GenericCallback): void;

			/** creates a state and the corresponding object */
			createState(parentDevice: string, parentChannel: string, stateName: string, roleOrCommon?: string | object, native?: any, options?: any, callback?: SetObjectCallback): void;
			/** deletes a state */
			deleteState(stateName: string, options?: any, callback?: GenericCallback): void;
			deleteState(parentChannel: string, stateName: string, options?: any, callback?: GenericCallback): void;
			deleteState(parentDevice: string, parentChannel: string, stateName: string, options?: any, callback?: GenericCallback): void;

			// ==============================
			// filesystem

			/**
			 * reads the content of directory from DB for given adapter and path
			 * @param adapter - adapter name. If adapter name is null, default will be the name of the current adapter.
			 * @param path - path to direcory without adapter name. E.g. If you want to read "/vis.0/main/views.json", here must be "/main/views.json" and _adapter must be equal to "vis.0".
			 */
			readDir(adapterName: string, path: string, callback: ReadDirCallback): void;
			readDir(adapterName: string, path: string, options: any, callback: ReadDirCallback): void;
			mkDir(adapterName: string, path: string, callback: GenericCallback): void;
			mkDir(adapterName: string, path: string, options: any, callback: GenericCallback): void;

			readFile(adapterName: string, path: string, callback: ReadFileCallback): void;
			readFile(adapterName: string, path: string, options: any, callback: ReadFileCallback): void;
			writeFile(adapterName: string, path: string, data: Buffer | string, callback: GenericCallback): void;
			writeFile(adapterName: string, path: string, data: Buffer | string, options: any, callback: GenericCallback): void; // options see https://github.com/ioBroker/ioBroker.js-controller/blob/master/lib/objects/objectsInMemServer.js#L599

			delFile(adapterName: string, path: string, callback: GenericCallback): void;
			delFile(adapterName: string, path: string, options: any, callback: GenericCallback): void;
			unlink(adapterName: string, path: string, callback: GenericCallback): void;
			unlink(adapterName: string, path: string, options: any, callback: GenericCallback): void;

			rename(adapterName: string, oldName: string, newName: string, callback: GenericCallback): void;
			rename(adapterName: string, oldName: string, newName: string, options: any, callback: GenericCallback): void;

			// ==============================
			// formatting

			formatValue(value: number | string, format: any): string;
			formatValue(value: number | string, decimals: number, format: any): string;
			formatDate(dateObj: string | Date | number, format: string): string;
			formatDate(dateObj: string | Date | number, isDuration: boolean | string, format: string): string;
		} // end interface Adapter

		type ObjectChangeHandler = (id: string, obj: ioBroker.Object) => void;
		type StateChangeHandler = (id: string, obj: State) => void;
		type MessageHandler = (obj: Message) => void;

		type SetObjectCallback = (err: string, obj: { id: string }) => void;
		type GetObjectCallback = (err: string, obj: ioBroker.Object) => void;
		type GenericCallback = (err?: string) => void;
		type GetEnumCallback = (err: string, enums: DictionaryLike<Enum>, requestedEnum: string) => void;
		type GetEnumsCallback = (
			err: string,
			result: {
				[groupName: string]: DictionaryLike<Enum>,
			},
		) => void;
		type GetObjectsCallback = (err: string, objects: DictionaryLike<ioBroker.Object>) => void;
		type FindObjectCallback = (err: string, id?: string, name?: string) => void;

		type GetStateCallback = (err: string, state: State) => void;
		type GetStatesCallback = (err: string, states: DictionaryLike<State>) => void;
		type SetStateCallback = (err: string, id: string) => void;
		type SetStateChangedCallback = (err: string, id: string, notChanged: boolean) => void;
		type DeleteStateCallback = (err: string, id?: string) => void;
		type GetHistoryCallback = (err: string, result: (State & { id?: string })[], step: number, sessionId?: string) => void;

		/** Contains the return values of readDir */
		interface ReadDirResult {
			/** Name of the file or directory */
			file: string;
			/** File system stats */
			stats: fs.Stats;
			/** Whether this is a directory or a file */
			isDir: boolean;
			/** Access rights */
			acl: any; // TODO: find out how this looks like
			/** Date of last modification */
			modifiedAt: number;
			/** Date of creation */
			createdAt: number;
		}
		type ReadDirCallback = (err: string, entries?: ReadDirResult[]) => void;
		type ReadFileCallback = (err: string, file?: Buffer | string, mimeType?: string) => void;

		/** Contains the return values of chownFile */
		interface ChownResult {
			/** The parent directory of the processed file or directory */
			path: string;
			/** Name of the file or directory */
			file: string;
			/** File system stats */
			stats: fs.Stats;
			/** Whether this is a directory or a file */
			isDir: boolean;
			/** Access rights */
			acl: any; // TODO: find out how this looks like
			/** Date of last modification */
			modifiedAt: number;
			/** Date of creation */
			createdAt: number;
		}
		type ChownFileCallback = (err: string, entries?: ChownResult[], id?: string) => void;

		/** Contains the return values of rm */
		interface RmResult {
			/** The parent directory of the deleted file or directory */
			path: string;
			/** The name of the deleted file or directory */
			file: string;
			/** Whether the deleted object was a directory or a file */
			isDir: boolean;
		}
		type RmCallback = (err: string, entries?: RmResult[]) => void;

		type GetUserGroupCallback = (objectsInstance: Objects, user: User, groups: UserGroup[], acl: ACL) => void;

		/** Contains the return values of chownObject */
		type ChownObjectResult = any; // TODO: find out what this looks like
		type ChownObjectCallback = (err: string, list?: ChownObjectResult[]) => void;

		type GetConfigKeysCallback = (err: string, list?: string[]) => void;
		// this is a version of the callback used by Objects.getObjects
		type GetObjectsCallback2 = (err: string, objects: (ioBroker.Object | {err: string})[]) => void;

	} // end namespace ioBroker
} // end declare global
