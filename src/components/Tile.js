import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import dayjs from "dayjs";

import * as constants from "../constants";

import Card from "@material-ui/core/Card";
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';

export default class Tile extends React.Component {
  constructor(props){
    super(props);
    this.data = props.events;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.type = props.type || "default";
    this.title = props.title;
    this.imageurl = props.imageurl;
    this.state = {
    }
  }

  eventToDiv(e){
    //return (
    //  <div className="border-2 p-2 text-base w-full max-h-96 overflow-x-hidden overflow-y-scroll no-scrollbar">
    //    <p className="text-center text-bold text-xl">{e.title}</p>
    //    {e.imageUrls && e.imageUrls.length > 0 && e.imageUrls.map((url) => <img className="w-full" src={url}/>)}
    //    {e.videoUrls && e.videoUrls.length > 0 && e.videoUrls.map((url) => <video soruce={url}/>)}
    //  </div>
    //)
    //
    console.log(e.imageUrls.length);
    return (
      <Card>
        <CardHeader
          title={e.title}
          subheader={e.date.format("MMM DD, YYYY")}
        >
        </CardHeader>
        {e.imageUrls.length > 0  &&
        <CardMedia
          style={{height: 0, paddingTop:"56.25%"}}
          classes="media"
          image={e.imageUrls[0]}
          title="Paella dish"
        />}
      </Card>
    )
  }

  render() {
    var toolTip;
    const tile = <div 
      className={`transform hover:scale-125 
      hover:bg-${constants.EVENT2COLOR[this.type]}-500 bg-${constants.EVENT2COLOR[this.type]}-300 
      hover:z-10 z-0 relative
      w-5 h-4 
      box-border m-0.5`}
    ></div>;
    if (this.data.length > 0) {
      toolTip = 
        <Tooltip arrow 
          enterDelay={0}
          leaveDelay={0}
          placement="top"
          open={true}
          title={
            <React.Fragment>
              {this.data.length > 0 && this.data.map((e) => <div>{this.eventToDiv(e)}</div>)}
            </React.Fragment>
          }
          className="text-red-400"
        >
          {tile}
        </Tooltip>
    } else {
      toolTip = tile

    }
    return (
      <React.Fragment>
        {toolTip}
      </React.Fragment>
    )
  }
}

