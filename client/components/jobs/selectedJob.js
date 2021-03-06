import moment from 'moment';
import React, { Component } from 'react';
import Cookies from 'js-cookie';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import { getJobDetail } from '../../actions/jobs';
import { setReviewInfo } from '../../actions/review';
import { queryApp } from '../../actions/applicants';

import ApplicantList from './applicantList';
import ApplyJob from './applyJob';
import ManageApplication from './manageApplication';
import JobMap from '../map/jobMap';

class SelectedJob extends Component {
  constructor(props) {
    super(props);
    this.redirectToReview = this.redirectToReview.bind(this);
    this.redirectToProfile = this.redirectToProfile.bind(this);
    this.countdownTimer = this.countdownTimer.bind(this);
  }

  componentDidMount() {
    this.props.getJobDetail(this.props.jobs.jobId)
    .then(() => {
      if (Cookies.getJSON('user').userid === this.props.jobs.job.user_id) {
        browserHistory.push('/jobAdmin');
      }
      const params = {
        job_id: this.props.jobs.jobId,
        user_id: Cookies.getJSON('user').userid
      };
      this.props.queryApp(params);
    });
  }

  countdownTimer(deadline) {
    const t = Date.parse(deadline) - Date.parse(new Date());
    const seconds = Math.floor((t / 1000) % 60);
    const minutes = Math.floor((t / 1000 / 60) % 60);
    const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    const days = Math.floor(t / (1000 * 60 * 60 * 24));
    return (`${days} days ${hours}:${minutes}:${seconds}`);
  }

  redirectToReview(e) {
    e.preventDefault();
    const params = {
      user_id: Cookies.getJSON('user').userid,
      job_id: this.props.jobs.jobId,
      rated_user: this.props.jobs.job.user_id,
      type: 'employee'
    };
    this.props.setReviewInfo(params);
    browserHistory.push('/createReview');
  }

  redirectToProfile() {
    browserHistory.push('/profile');
  }

  render() {
    let userAdmin;
    //case 1: job canceled, show job is canceled
    if (this.props.jobs.job.status === 'canceled') {
      userAdmin = <p> This job is canceled </p>;
    } else {
    //case 2: job active
      //case 2a: user applied
      if (this.props.apply.entry) {
        //case 2a(i): status is  accepted / rejected, render current job status
        if (this.props.apply.entry.job_status === 'accepted'
        || this.props.apply.entry.job_status === 'rejected') {
          userAdmin = (
            <div>
              <h3>Manage Application</h3>
              <hr />
              <p> Your current job status is: {this.props.apply.entry.job_status} </p>
            </div>
          );
        }
        //case 2a(ii): status is completed, render Review
        if (this.props.apply.entry.job_status === 'completed') {
          userAdmin = (
            <div>
              <h3>Manage Application</h3>
              <hr />
              Your job is completed! Please leave a feedback!<br />
              <button
                className="btn btn-secondary"
                onClick={this.redirectToReview}
              >
                Review
              </button>
            </div>
          );
        } else {
        //case 2a(iii): status is pending, render ManageApplication
          userAdmin = <ManageApplication />;
        }
      } else {
      //case 2b: user did not apply before, render ApplyJob
        userAdmin = <ApplyJob />;
      }
    }

    return (
      <div className="selected-job">
        {/* <JobMap /> */}
        <div className="container center">
          <h3> {this.props.jobs.job.jobName} </h3>
          <hr />
          <div className="row">
            <div className="col-md-4">
              <p> Openings: {this.props.jobs.job.openings} </p>
            </div>
            <div className="col-md-4">
              <p className="clock">
                <i className="fa fa-clock-o" aria-hidden="true"></i>
                {this.countdownTimer(this.props.jobs.job.deadline)}
              </p>
            </div>
            <div className="col-md-4">
              <p className="price">
                Price:
                <i className="fa fa-usd" aria-hidden="true"></i>
                {this.props.jobs.job.max_price}.00
              </p>
            </div>
          </div>
          <p>
            Job Owner:
            <a onClick={this.redirectToProfile}> {this.props.jobs.job.username} </a>
          </p>
          <p>
            Category:
            {this.props.jobs.job.category[0].toUpperCase() + this.props.jobs.job.category.slice(1)}
          </p>
          <p> Address: {this.props.jobs.job.address} </p>
          <p> Description: {this.props.jobs.job.description} </p>
          <p> Job Created: {moment(this.props.jobs.job.createdAt).format('LLL')} </p>
          <p> Deadline: {moment(this.props.jobs.job.deadline).format('LLL')} </p>
          {userAdmin}
          <ApplicantList />

        </div>
      </div>
    );
  }
}

function mapStateToProps({ jobs, apply, review }) {
  return { jobs, apply, review };
}

export default connect(mapStateToProps, { getJobDetail, queryApp, setReviewInfo })(SelectedJob);
