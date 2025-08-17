export interface GoogleDriveFile {
  parents: string[]
  lastModifyingUser: LastModifyingUser
  owners: Owner[]
  spaces: string[]
  capabilities: Capabilities
  linkShareMetadata: LinkShareMetadata
  downloadRestrictions: DownloadRestrictions
  kind: string
  id: string
  name: string
  mimeType: string
  starred: boolean
  trashed: boolean
  explicitlyTrashed: boolean
  version: string
  webContentLink: string
  webViewLink: string
  iconLink: string
  hasThumbnail: boolean
  thumbnailLink: string
  thumbnailVersion: string
  viewedByMe: boolean
  createdTime: string
  modifiedTime: string
  modifiedByMe: boolean
  shared: boolean
  ownedByMe: boolean
  viewersCanCopyContent: boolean
  copyRequiresWriterPermission: boolean
  writersCanShare: boolean
  originalFilename: string
  fullFileExtension: string
  fileExtension: string
  md5Checksum: string
  sha1Checksum: string
  sha256Checksum: string
  size: string
  quotaBytesUsed: string
  headRevisionId: string
  isAppAuthorized: boolean
  inheritedPermissionsDisabled: boolean
}

export interface LastModifyingUser {
  displayName: string
  kind: string
  me: boolean
  permissionId: string
  emailAddress: string
  photoLink: string
}

export interface Owner {
  displayName: string
  kind: string
  me: boolean
  permissionId: string
  emailAddress: string
  photoLink: string
}

export interface Capabilities {
  canAcceptOwnership: boolean
  canAddChildren: boolean
  canAddMyDriveParent: boolean
  canChangeCopyRequiresWriterPermission: boolean
  canChangeItemDownloadRestriction: boolean
  canChangeSecurityUpdateEnabled: boolean
  canChangeViewersCanCopyContent: boolean
  canComment: boolean
  canCopy: boolean
  canDelete: boolean
  canDisableInheritedPermissions: boolean
  canDownload: boolean
  canEdit: boolean
  canEnableInheritedPermissions: boolean
  canListChildren: boolean
  canModifyContent: boolean
  canModifyContentRestriction: boolean
  canModifyEditorContentRestriction: boolean
  canModifyOwnerContentRestriction: boolean
  canModifyLabels: boolean
  canMoveChildrenWithinDrive: boolean
  canMoveItemIntoTeamDrive: boolean
  canMoveItemOutOfDrive: boolean
  canMoveItemWithinDrive: boolean
  canReadLabels: boolean
  canReadRevisions: boolean
  canRemoveChildren: boolean
  canRemoveContentRestriction: boolean
  canRemoveMyDriveParent: boolean
  canRename: boolean
  canShare: boolean
  canTrash: boolean
  canUntrash: boolean
}

export interface LinkShareMetadata {
  securityUpdateEligible: boolean
  securityUpdateEnabled: boolean
}

export interface DownloadRestrictions {
  itemDownloadRestriction: ItemDownloadRestriction
  effectiveDownloadRestrictionWithContext: EffectiveDownloadRestrictionWithContext
}

export interface ItemDownloadRestriction {
  restrictedForReaders: boolean
  restrictedForWriters: boolean
}

export interface EffectiveDownloadRestrictionWithContext {
  restrictedForReaders: boolean
  restrictedForWriters: boolean
}
