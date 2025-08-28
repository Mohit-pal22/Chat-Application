import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadProfilePic } from "../../apiCalls/user";
import { hideLoader, showLoader } from "../../redux/loaderSlice";
import toast from 'react-hot-toast';
import { setUser } from "../../redux/userSlice";

function Profile() {
    const { user } = useSelector(state => state.userReducer);
    const [image, setImage] = useState('');
    const dispatch = useDispatch();

    const getIntials = () => {
        const f = user?.firstname.toUpperCase()[0];
        const l = user?.lastname.toUpperCase()[0];
        return f + l;
    }

    const getFullname = () => {
        const fname = user?.firstname
            ? user.firstname.at(0).toUpperCase() + user.firstname.slice(1).toLowerCase()
            : '';
        const lname = user?.lastname
            ? user.lastname.at(0).toUpperCase() + user.lastname.slice(1).toLowerCase()
            : '';
        return `${fname} ${lname}`.trim();
    };

    const onFileSelect = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader(file);

        reader.readAsDataURL(file);

        reader.onloadend = async () => {
            setImage(reader.result);
        }
    }

    const updateProfilePic = async () => {
        try {
            dispatch(showLoader());
            const response = await uploadProfilePic(image);
            dispatch(hideLoader());

            if (response.success) {
                toast.success(response.success);
                dispatch(setUser(response.data));
            }
            else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error(error.message);
            dispatch(hideLoader())
        }
    }

    useEffect(() => {
        if (user?.profilePic) {
            setImage(user.profilePic);
        }
    }, [user])
    return (
        <div className="profile-page-container">
            <div className="profile-pic-container">
                {image && <img src={image}
                    alt="Profile Pic"
                    className="user-profile-pic-upload"
                />}
                {!image && <div className="user-default-profile-avatar">
                    {getIntials()}
                </div>}
            </div>

            <div className="profile-info-container">
                <div className="user-profile-name">
                    <h1>{getFullname()}</h1>
                </div>
                <div>
                    <b>Email: </b> {user?.email}
                </div>
                <div>
                    <b>Account Created: </b> {moment(user?.createdAt).format('MMMM DD, YYYY')}
                </div>
                <div className="select-profile-pic-container">
                    <input type="file" onChange={onFileSelect} />
                    <button className="upload-img-btn" onClick={updateProfilePic}>Upload</button>
                </div>
            </div>
        </div>)
}

export default Profile;