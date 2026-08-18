import { X } from "lucide-react";
import UploadVideo from "../../../lazy/UploadVedio";
import { Controller } from "react-hook-form";

interface TopicFormProps {
  moduleIndex: number;
  topicIndex: number;
  register: any;
  errors: any;
  onRemoveTopic: () => void;
  canRemove: boolean;
  control: any;
}

export default function TopicForm({ moduleIndex, topicIndex, register, errors, onRemoveTopic, canRemove, control }: TopicFormProps) {
  return (
    <div className="bg-gray-50/50 border border-gray-200 rounded-lg p-5 space-y-4 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
            {topicIndex + 1}
          </div>
          <h4 className="text-sm font-medium text-gray-800">Topic {topicIndex + 1}</h4>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemoveTopic}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Remove topic"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Topic Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topic Title *
        </label>
        <input
          type="text"
          {...register(`modules.${moduleIndex}.topics.${topicIndex}.title`)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
          placeholder="Enter topic title"
        />
        {errors?.modules?.[moduleIndex]?.topics?.[topicIndex]?.title && (
          <p className="text-red-500 text-sm mt-1">
            {errors.modules[moduleIndex].topics[topicIndex].title.message}
          </p>
        )}
      </div>

      {/* Topic Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topic Content
        </label>
        <textarea
          {...register(`modules.${moduleIndex}.topics.${topicIndex}.content`)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm resize-vertical"
          placeholder="Enter topic content, learning objectives, or key points..."
        />
        {errors?.modules?.[moduleIndex]?.topics?.[topicIndex]?.content && (
          <p className="text-red-500 text-sm mt-1">
            {errors.modules[moduleIndex].topics[topicIndex].content.message}
          </p>
        )}
      </div>

      {/* Video URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video URL
        </label>
        <Controller
          name={`modules.${moduleIndex}.topics.${topicIndex}.videoUrl`}
          control={control}
          render={({ field }) => (
            <UploadVideo
              videoUrl={field.value}
              setVideoUrl={(url: string) => field.onChange(url)}
              width={"full"}
              height={"full"}
              text={`Click to upload video`}
              setVideoDuration={() => {}}
            />
          )}
        />
        {errors?.modules?.[moduleIndex]?.topics?.[topicIndex]?.videoUrl && (
          <p className="text-red-500 text-sm mt-1">
            {errors.modules[moduleIndex].topics[topicIndex].videoUrl.message}
          </p>
        )}
      </div>
    </div>
  );
}