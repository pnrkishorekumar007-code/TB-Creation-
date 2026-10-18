// Maps a DB media path such as "/uploads/covers/1699999-123.png" to its
// Cloudinary key. The mapping is fully deterministic from the path, so the
// upload, serve and delete code paths never need to pass extra fields around.
//
// DB path layout:  /uploads/<kind>/<filename>
// Cloudinary id:   tb/<kind>/<filename-without-ext>   (resource_type image)
//                  tb/<kind>/<filename>               (resource_type raw)
const KIND_RESOURCE = {
  covers: 'image',
  pages: 'image',
  avatars: 'image',
  scripts: 'raw',
};

const MEDIA_PATH_RE = /^\/uploads\/([A-Za-z0-9_-]+)\/(.+)$/;

const parseMediaPath = (file) => {
  const match = MEDIA_PATH_RE.exec(file || '');
  if (!match) return null;

  const [, kind, filename] = match;
  const resourceType = KIND_RESOURCE[kind] || 'image';
  const isRaw = resourceType === 'raw';

  return {
    kind,
    filename,
    resourceType,
    publicId: isRaw ? `tb/${kind}/${filename}` : `tb/${kind}/${filename.replace(/\.[^.]+$/, '')}`,
    format: isRaw ? undefined : filename.split('.').pop(),
  };
};

module.exports = { parseMediaPath, KIND_RESOURCE };
