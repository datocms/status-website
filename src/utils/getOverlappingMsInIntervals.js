export default function getOverlappingMsInIntervals(intervalLeft, intervalRight) {
  let leftStartTime = intervalLeft.start.getTime()
  let leftEndTime = intervalLeft.end.getTime()
  let rightStartTime = intervalRight.start.getTime()
  let rightEndTime = intervalRight.end.getTime()

  var isOverlapping = leftStartTime < rightEndTime && rightStartTime < leftEndTime

  if (!isOverlapping) {
    return 0
  }

  var overlapStartDate =
    rightStartTime < leftStartTime ? leftStartTime : rightStartTime

  var overlapEndDate = rightEndTime > leftEndTime ? leftEndTime : rightEndTime

  return overlapEndDate - overlapStartDate;
}
